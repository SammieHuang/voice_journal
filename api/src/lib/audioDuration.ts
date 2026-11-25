import fs from "fs";

/**
 * Measures how long an uploaded .m4a (AAC audio in an MP4 container) plays,
 * without decoding it, so recordings that are too long can be rejected before
 * they reach OpenAI.
 *
 * The duration fields in an MP4 are just numbers the client wrote, so this
 * takes the LONGEST of everything the file states or implies:
 *   - movie header (mvhd) and audio track header (mdhd) durations,
 *   - the per-frame timing table (stts),
 *   - the edit list (elst), which can make players repeat parts,
 *   - frame count x 1024 samples at the stream's real sample rate (from the
 *     AAC config). A decoder plays every frame regardless of the timing
 *     fields, so a file can't shrink its real length by lying in its headers.
 *
 * Anything it can't measure confidently is rejected with UnsupportedAudioError
 * (not an MP4, fragmented MP4, not exactly one audio track, not AAC, tables
 * that contradict each other, malformed boxes).
 */

class UnsupportedAudioError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "UnsupportedAudioError";
  }
}

const fail = (reason: string): never => {
  throw new UnsupportedAudioError(reason);
};

/** AAC frames are 1024 samples (960 in a rare variant; 1024 over-estimates, which is the safe side). */
const AAC_SAMPLES_PER_FRAME = 1024;
const AAC_SAMPLE_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
/** AAC Main, LC, SSR, LTP, and HE-AAC v1/v2 (SBR/PS): all 1024 samples per frame at the core rate. */
const SUPPORTED_AAC_OBJECT_TYPES = new Set([1, 2, 3, 4, 5, 29]);
/** esds objectTypeIndication: MPEG-4 audio, MPEG-2 AAC Main/LC/SSR. */
const SUPPORTED_OBJECT_TYPE_INDICATIONS = new Set([0x40, 0x66, 0x67, 0x68]);

const MAX_TOP_LEVEL_BOXES = 1000;
const MAX_BOXES_IN_MOOV = 10000;
const MAX_MOOV_BYTES = 16 * 1024 * 1024;

type Box = { type: string; start: number; end: number }; // start/end of the box's content

/** Child boxes of buf[start, end). Every size is bounds-checked. */
const childBoxes = (buf: Buffer, start: number, end: number, counter: { n: number }): Box[] => {
  const boxes: Box[] = [];
  let pos = start;
  while (pos < end) {
    if (++counter.n > MAX_BOXES_IN_MOOV) fail("too many boxes");
    if (end - pos < 8) fail("truncated box header");
    let size = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    let headerSize = 8;
    if (size === 1) {
      if (end - pos < 16) fail("truncated box header");
      size = Number(buf.readBigUInt64BE(pos + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - pos;
    }
    if (size < headerSize || size > end - pos) fail(`bad size for box ${JSON.stringify(type)}`);
    boxes.push({ type, start: pos + headerSize, end: pos + size });
    pos += size;
  }
  return boxes;
};

/** Bounds-checked reads inside one box's content. */
const reader = (buf: Buffer, box: Box) => {
  const need = (offset: number, len: number) => {
    if (offset < 0 || box.start + offset + len > box.end) fail(`box ${box.type} is too short`);
    return box.start + offset;
  };
  return {
    u8: (o: number) => buf.readUInt8(need(o, 1)),
    u16: (o: number) => buf.readUInt16BE(need(o, 2)),
    u32: (o: number) => buf.readUInt32BE(need(o, 4)),
    u64: (o: number) => Number(buf.readBigUInt64BE(need(o, 8))),
    bytes: (o: number, len: number) => buf.subarray(need(o, len), box.start + o + len),
    length: box.end - box.start,
  };
};

const only = (boxes: Box[], type: string, where: string): Box => {
  const found = boxes.filter((b) => b.type === type);
  if (found.length !== 1) fail(`expected exactly one ${type} in ${where}, found ${found.length}`);
  return found[0];
};

/** mvhd / mdhd: version 0 = 32-bit fields, version 1 = 64-bit. Returns seconds, or null for "unknown". */
const headerDuration = (buf: Buffer, box: Box): { timescale: number; seconds: number | null } => {
  const r = reader(buf, box);
  const version = r.u8(0);
  if (version > 1) fail(`unknown ${box.type} version`);
  const timescale = version === 1 ? r.u32(20) : r.u32(12);
  const duration = version === 1 ? r.u64(24) : r.u32(16);
  if (timescale === 0) fail(`${box.type} timescale is 0`);
  const unknown = version === 1 ? duration === Number(0xffffffffffffffffn) : duration === 0xffffffff;
  return { timescale, seconds: unknown ? null : duration / timescale };
};

/** Sum of all edit list segment durations, in movie timescale units. */
const editListTicks = (buf: Buffer, box: Box): number => {
  const r = reader(buf, box);
  const version = r.u8(0);
  if (version > 1) fail("unknown elst version");
  const entries = r.u32(4);
  const entrySize = version === 1 ? 20 : 12;
  if (entries * entrySize > r.length - 8) fail("elst entry count is larger than the box");
  let total = 0;
  for (let i = 0; i < entries; i++) {
    const o = 8 + i * entrySize;
    total += version === 1 ? r.u64(o) : r.u32(o);
  }
  return total;
};

/** Variable-length size used by MPEG-4 descriptors in esds. */
const descriptor = (buf: Buffer, pos: number, end: number) => {
  if (pos + 2 > end) fail("truncated esds descriptor");
  const tag = buf[pos++];
  let size = 0;
  for (let i = 0; i < 4; i++) {
    if (pos >= end) fail("truncated esds descriptor");
    const b = buf[pos++];
    size = (size << 7) | (b & 0x7f);
    if (!(b & 0x80)) break;
    if (i === 3) fail("bad esds descriptor size");
  }
  if (pos + size > end) fail("esds descriptor runs past its box");
  return { tag, start: pos, end: pos + size };
};

/** Core AAC sample rate from the AudioSpecificConfig inside esds. */
const aacCoreSampleRate = (buf: Buffer, esds: Box): number => {
  let pos = esds.start + 4; // version + flags
  const es = descriptor(buf, pos, esds.end);
  if (es.tag !== 0x03) fail("esds has no ES descriptor");
  pos = es.start + 2; // ES_ID
  if (pos >= es.end) fail("truncated ES descriptor");
  const flags = buf[pos++];
  if (flags & 0x80) pos += 2; // dependsOn_ES_ID
  if (flags & 0x40) {
    if (pos >= es.end) fail("truncated ES descriptor");
    pos += 1 + buf[pos]; // URL
  }
  if (flags & 0x20) pos += 2; // OCR_ES_ID

  const dc = descriptor(buf, pos, es.end);
  if (dc.tag !== 0x04) fail("esds has no decoder config");
  if (dc.end - dc.start < 13) fail("truncated decoder config");
  if (!SUPPORTED_OBJECT_TYPE_INDICATIONS.has(buf[dc.start])) fail("audio codec is not AAC");

  const asc = descriptor(buf, dc.start + 13, dc.end);
  if (asc.tag !== 0x05) fail("esds has no AAC config");

  // AudioSpecificConfig bit fields
  let bit = asc.start * 8;
  const bits = (n: number) => {
    if (bit + n > asc.end * 8) fail("truncated AAC config");
    let v = 0;
    for (let i = 0; i < n; i++, bit++) v = (v << 1) | ((buf[bit >> 3] >> (7 - (bit & 7))) & 1);
    return v;
  };
  let objectType = bits(5);
  if (objectType === 31) objectType = 32 + bits(6);
  if (!SUPPORTED_AAC_OBJECT_TYPES.has(objectType)) fail(`unsupported AAC type ${objectType}`);
  // The first sampling frequency is the core rate, even for HE-AAC (the SBR
  // output rate comes later) -- and frames are 1024 samples at the core rate.
  const index = bits(4);
  const rate = index === 0xf ? bits(24) : AAC_SAMPLE_RATES[index];
  if (!rate) fail("bad AAC sample rate");
  return rate;
};

/** The single AAC sample entry's core sample rate. */
const sampleRateFromStsd = (buf: Buffer, stsd: Box): number => {
  const r = reader(buf, stsd);
  if (r.u32(4) !== 1) fail("expected exactly one sample description");
  const entries = childBoxes(buf, stsd.start + 8, stsd.end, { n: 0 });
  if (entries.length !== 1) fail("expected exactly one sample description");
  const entry = entries[0];
  if (entry.type !== "mp4a") fail(`audio codec ${JSON.stringify(entry.type)} is not AAC`);

  // SampleEntry (8 bytes) + AudioSampleEntry (20). QuickTime sound
  // description versions 1 and 2 add 16 / 36 bytes before the child boxes.
  const soundVersion = reader(buf, entry).u16(8);
  const fixed = soundVersion === 0 ? 28 : soundVersion === 1 ? 44 : soundVersion === 2 ? 64 : fail("unknown sound description version");
  if (entry.start + fixed > entry.end) fail("truncated sample description");
  const children = childBoxes(buf, entry.start + fixed, entry.end, { n: 0 });

  let esds = children.find((b) => b.type === "esds");
  const wave = children.find((b) => b.type === "wave"); // QuickTime puts esds inside "wave"
  if (!esds && wave) esds = childBoxes(buf, wave.start, wave.end, { n: 0 }).find((b) => b.type === "esds");
  if (!esds) fail("AAC sample description has no esds");
  return aacCoreSampleRate(buf, esds!);
};

/** stts: total samples and total ticks. */
const timeToSample = (buf: Buffer, stts: Box) => {
  const r = reader(buf, stts);
  const entries = r.u32(4);
  if (entries * 8 > r.length - 8) fail("stts entry count is larger than the box");
  let samples = 0;
  let ticks = 0;
  for (let i = 0; i < entries; i++) {
    const count = r.u32(8 + i * 8);
    samples += count;
    ticks += count * r.u32(12 + i * 8);
  }
  return { samples, ticks };
};

/** stsz / stz2: number of frames. */
const frameCount = (buf: Buffer, stbl: Box[]): number => {
  const sizes = stbl.filter((b) => b.type === "stsz" || b.type === "stz2");
  if (sizes.length !== 1) fail("expected exactly one sample size table");
  return reader(buf, sizes[0]).u32(8);
};

/** Where the bytes come from: a file in production, a buffer in tests. */
type ByteSource = {
  size: number;
  read: (position: number, length: number) => Promise<Buffer>;
};

const readExactly = async (source: ByteSource, position: number, length: number) => {
  const buf = await source.read(position, length);
  if (buf.length !== length) fail("file ended early");
  return buf;
};

/** Reads only box headers and the moov box (the index), never the audio data. */
const readMoov = async (source: ByteSource): Promise<Buffer> => {
  const fileSize = source.size;
  let pos = 0;
  let boxes = 0;
  let moov: Buffer | null = null;
  while (pos < fileSize) {
    if (++boxes > MAX_TOP_LEVEL_BOXES) fail("too many top-level boxes");
    if (fileSize - pos < 8) fail("truncated box header");
    const header = await readExactly(source, pos, 8);
    let size = header.readUInt32BE(0);
    const type = header.toString("latin1", 4, 8);
    let headerSize = 8;
    if (pos === 0 && type !== "ftyp") fail("not an MP4/M4A file");
    if (size === 1) {
      if (fileSize - pos < 16) fail("truncated box header");
      size = Number((await readExactly(source, pos + 8, 8)).readBigUInt64BE(0));
      headerSize = 16;
    } else if (size === 0) {
      size = fileSize - pos;
    }
    if (size < headerSize || size > fileSize - pos) fail(`bad size for box ${JSON.stringify(type)}`);

    if (type === "moof" || type === "mfra") fail("fragmented MP4 is not supported");
    if (type === "moov") {
      if (moov) fail("more than one moov box");
      if (size - headerSize > MAX_MOOV_BYTES) fail("moov box is too large");
      moov = await readExactly(source, pos + headerSize, size - headerSize);
    }
    pos += size;
  }
  if (!moov) fail("no moov box (not a complete MP4/M4A file)");
  return moov!;
};

type AudioDuration = {
  /** What we go by: the longest of all the values below. */
  seconds: number;
  sources: {
    movieHeader: number | null;
    trackHeader: number | null;
    frameTimings: number;
    frames: number;
    editList: number | null;
  };
};

/** Measures an .m4a from any byte source (the file-path version is below). */
const measureM4a = async (source: ByteSource): Promise<AudioDuration> => {
  const moov = await readMoov(source);
  const counter = { n: 0 };
  const moovBoxes = childBoxes(moov, 0, moov.length, counter);

  if (moovBoxes.some((b) => b.type === "mvex")) fail("fragmented MP4 is not supported");
  const mvhd = headerDuration(moov, only(moovBoxes, "mvhd", "moov"));

  const audioTracks = moovBoxes
    .filter((b) => b.type === "trak")
    .map((trak) => {
      const trakBoxes = childBoxes(moov, trak.start, trak.end, counter);
      const mdia = only(trakBoxes, "mdia", "trak");
      const mdiaBoxes = childBoxes(moov, mdia.start, mdia.end, counter);
      const handler = reader(moov, only(mdiaBoxes, "hdlr", "mdia")).bytes(8, 4).toString("latin1");
      return { trakBoxes, mdiaBoxes, handler };
    })
    .filter((t) => t.handler === "soun");
  if (audioTracks.length !== 1) fail(`expected exactly one audio track, found ${audioTracks.length}`);
  const { trakBoxes, mdiaBoxes } = audioTracks[0];

  const mdhd = headerDuration(moov, only(mdiaBoxes, "mdhd", "mdia"));
  const minf = only(mdiaBoxes, "minf", "mdia");
  const stbl = only(childBoxes(moov, minf.start, minf.end, counter), "stbl", "minf");
  const stblBoxes = childBoxes(moov, stbl.start, stbl.end, counter);

  const sampleRate = sampleRateFromStsd(moov, only(stblBoxes, "stsd", "stbl"));
  const timings = timeToSample(moov, only(stblBoxes, "stts", "stbl"));
  const frames = frameCount(moov, stblBoxes);
  if (timings.samples !== frames) fail("frame timing and frame size tables disagree");

  let editList: number | null = null;
  const edts = trakBoxes.find((b) => b.type === "edts");
  if (edts) {
    const elst = childBoxes(moov, edts.start, edts.end, counter).find((b) => b.type === "elst");
    if (elst) editList = editListTicks(moov, elst) / mvhd.timescale;
  }

  const sources = {
    movieHeader: mvhd.seconds,
    trackHeader: mdhd.seconds,
    frameTimings: timings.ticks / mdhd.timescale,
    frames: (frames * AAC_SAMPLES_PER_FRAME) / sampleRate,
    editList,
  };
  const seconds = Math.max(
    ...Object.values(sources).filter((v): v is number => v !== null && Number.isFinite(v)),
  );
  return { seconds, sources };
};

/** Measures an uploaded .m4a file. */
const measureM4aDuration = async (filePath: string): Promise<AudioDuration> => {
  const file = await fs.promises.open(filePath, "r");
  try {
    const { size } = await file.stat();
    return await measureM4a({
      size,
      read: async (position, length) => {
        const buf = Buffer.alloc(length);
        const { bytesRead } = await file.read(buf, 0, length, position);
        return buf.subarray(0, bytesRead);
      },
    });
  } finally {
    await file.close();
  }
};

export { measureM4a, measureM4aDuration, UnsupportedAudioError };
export type { AudioDuration, ByteSource };

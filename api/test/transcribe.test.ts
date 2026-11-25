import fs from "fs";
import { MAX_AUDIO_BYTES } from "../src/routes/transcribe";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import type { Express } from "express";
import { createApp } from "../src/app";
import { DAILY_LIMIT_ENV } from "../src/lib/config";
import { createTestDb, usageCount, utcToday } from "./helpers/testDb";
import {
  backends,
  resetBackends,
  holdNextConsumeCalls,
} from "./helpers/fakeBackends";
import http from "http";
import type { AddressInfo } from "net";
import path from "path";

// Swap the real Supabase and OpenAI clients for the fakes.
vi.mock("../src/lib/supabase", async () =>
  (await import("./helpers/fakeBackends.js")).fakeSupabaseModule(),
);
vi.mock("../src/lib/openai", async () =>
  (await import("./helpers/fakeBackends.js")).fakeOpenAIModule(),
);

const PRO = {
  id: "aaaaaaaa-0000-0000-0000-000000000001",
  tier: "premium" as const,
  token: "pro-token",
};

const FREE = {
  id: "bbbbbbbb-0000-0000-0000-000000000001",
  tier: "free" as const,
  token: "free-token",
};

// No duration check yet, so any bytes are accepted as "audio".
/** A real 1-second .m4a, generated with ffmpeg (see test/fixtures). */
const ONE_SECOND_M4A = fs.readFileSync(
  path.join(__dirname, "fixtures", "one-second.m4a"),
);

/** The 1-second recording padded to exactly `size` bytes with a "free" box (players skip it). */
const recordingOfSize = (size: number) => {
  const padding = Buffer.alloc(size - ONE_SECOND_M4A.length);
  padding.writeUInt32BE(padding.length, 0);
  padding.write("free", 4, "latin1");
  return Buffer.concat([ONE_SECOND_M4A, padding]);
};

let db: PGlite;

/** Midnight UTC at the end of the given "YYYY-MM-DD" day. */
const nextUtcMidnight = (day: string) => {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
};

/** POST /transcribe the way the mobile app does. */
const transcribe = (app: Express, token?: string, audio = ONE_SECOND_M4A) => {
  const req = request(app).post("/transcribe");
  if (token) req.set("Authorization", `Bearer ${token}`);
  return req.attach("audio", audio, "recording.m4a");
};

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await db.exec(
    "truncate public.cloud_transcription_usage; delete from auth.users;",
  );
  resetBackends(db);
  for (const user of [PRO, FREE]) {
    backends.usersByToken.set(user.token, { id: user.id, tier: user.tier });
    await db.query("insert into auth.users (id) values ($1)", [user.id]);
  }
  delete process.env[DAILY_LIMIT_ENV];
  fs.rmSync("uploads", { recursive: true, force: true });
  fs.mkdirSync("uploads");
});

describe("POST /transcribe", () => {
  it("missing token -> 401, nothing counted, OpenAI not called", async () => {
    const res = await transcribe(createApp());
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Missing token" });
    expect(backends.rpcCalls).toEqual([]);
    expect(backends.openaiCalls).toBe(0);
  });

  it("free account -> 403, nothing counted, OpenAI not called", async () => {
    const res = await transcribe(createApp(), FREE.token);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Premium subscription required" });
    expect(backends.rpcCalls).toEqual([]);
    expect(backends.openaiCalls).toBe(0);
  });

  it("over the daily limit -> 429 with when it resets, OpenAI not called", async () => {
    process.env[DAILY_LIMIT_ENV] = "2";
    const app = createApp();
    const today = await utcToday(db);

    expect((await transcribe(app, PRO.token)).status).toBe(200);
    expect((await transcribe(app, PRO.token)).status).toBe(200);

    const res = await transcribe(app, PRO.token);
    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({
      error: "daily_limit_reached",
      limit: 2,
      used: 2,
      resetsAt: nextUtcMidnight(today),
    });
    const retryAfter = Number(res.headers["retry-after"]);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(24 * 60 * 60);
    expect(backends.openaiCalls).toBe(2);
    expect(await usageCount(db, PRO.id)).toBe(2);
  });

  it("database error -> 503, OpenAI not called", async () => {
    backends.rpcError = "connection refused";
    const res = await transcribe(createApp(), PRO.token);
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("limit_check_unavailable");
    expect(backends.openaiCalls).toBe(0);
  });

  it("OpenAI fails -> 502 and the transcription is given back", async () => {
    backends.openaiError = new Error("OpenAI is down");
    const res = await transcribe(createApp(), PRO.token);
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("transcription_failed");
    expect(backends.rpcCalls).toEqual([
      "consume_cloud_transcription",
      "release_cloud_transcription",
    ]);
    expect(await usageCount(db, PRO.id)).toBe(0);
  });

  it("pro account -> 200 with the transcript, counted once", async () => {
    const res = await transcribe(createApp(), PRO.token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: backends.transcript });
    expect(backends.openaiCalls).toBe(1);
    expect(await usageCount(db, PRO.id)).toBe(1);
  });

  it("last one left, two requests at once -> one 200, one 429", async () => {
    process.env[DAILY_LIMIT_ENV] = "2";
    const app = createApp();
    expect((await transcribe(app, PRO.token)).status).toBe(200);

    holdNextConsumeCalls(2);
    const [first, second] = await Promise.all([
      transcribe(app, PRO.token),
      transcribe(app, PRO.token),
    ]);

    expect([first.status, second.status].sort()).toEqual([200, 429]);
    expect(backends.openaiCalls).toBe(2);
    expect(await usageCount(db, PRO.id)).toBe(2);
  });

  it("10 MB + 1 byte -> 413, nothing counted, no temp file left", async () => {
    const tooBig = Buffer.alloc(MAX_AUDIO_BYTES + 1);
    const res = await transcribe(createApp(), PRO.token, tooBig);
    expect(res.status).toBe(413);
    expect(res.body.error).toBe("file_too_large");
    expect(backends.rpcCalls).toEqual([]);
    expect(fs.readdirSync("uploads")).toEqual([]);
  });

  it("exactly 10 MB -> accepted, temp file deleted afterwards", async () => {
    const justRight = recordingOfSize(MAX_AUDIO_BYTES);
    const res = await transcribe(createApp(), PRO.token, justRight);
    expect(res.status).toBe(200);
    expect(fs.readdirSync("uploads")).toEqual([]);
  });

  it("wrong field name -> JSON 400, no temp file left", async () => {
    const res = await request(createApp())
      .post("/transcribe")
      .set("Authorization", `Bearer ${PRO.token}`)
      .attach("file", ONE_SECOND_M4A, "recording.m4a");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_upload");
    expect(fs.readdirSync("uploads")).toEqual([]);
  });

  it("client disconnects halfway -> partial file deleted", async () => {
    const server = createApp().listen(0);
    try {
      const { port } = server.address() as AddressInfo;
      const boundary = "----test";
      const req = http.request({
        port,
        method: "POST",
        path: "/transcribe",
        headers: {
          Authorization: `Bearer ${PRO.token}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": String(5 * 1024 * 1024), // promise 5 MB...
        },
      });
      req.on("error", () => {}); // we cut the connection ourselves below

      // ...but only send the start of the file.
      req.write(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="audio"; filename="r.m4a"\r\n\r\n`,
      );
      req.write(Buffer.alloc(512 * 1024));

      await vi.waitFor(() => expect(fs.readdirSync("uploads")).toHaveLength(1));
      req.destroy();
      await vi.waitFor(() => expect(fs.readdirSync("uploads")).toEqual([]));
      expect(backends.openaiCalls).toBe(0);
    } finally {
      server.close();
    }
  });

    it("exactly 5 minutes -> accepted", async () => {
      const audio = fs.readFileSync(
        path.join(__dirname, "fixtures", "five-minutes.m4a"),
      );
      const res = await transcribe(createApp(), PRO.token, audio);
      expect(res.status).toBe(200);
    });

    it("6 minutes -> 413, nothing counted, OpenAI not called", async () => {
      const audio = fs.readFileSync(
        path.join(__dirname, "fixtures", "six-minutes.m4a"),
      );
      const res = await transcribe(createApp(), PRO.token, audio);
      expect(res.status).toBe(413);
      expect(res.body.error).toBe("recording_too_long");
      expect(backends.rpcCalls).toEqual([]);
      expect(backends.openaiCalls).toBe(0);
    });
  
    it("not an m4a -> 415, nothing counted, OpenAI not called", async () => {
      const res = await transcribe(
        createApp(),
        PRO.token,
        Buffer.from("just some text"),
      );
      expect(res.status).toBe(415);
      expect(res.body.error).toBe("unsupported_audio");
      expect(backends.rpcCalls).toEqual([]);
      expect(backends.openaiCalls).toBe(0);
    });
});

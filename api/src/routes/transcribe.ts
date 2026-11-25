import { Router, type RequestHandler } from "express";
import fs from "fs";
import multer from "multer";
import { transcribeAudio } from "../services/transcribeService";
import {
  quotaResetsAt,
  releaseCloudTranscription,
  reserveCloudTranscription,
} from "../services/transcriptionQuotaService";
import { requirePremium } from "../middleware/requirePremium";
import { createTempAudioStorage } from "../lib/tempAudioStorage";
import { describeSeconds, MAX_RECORDING_SECONDS } from "@voice-journal/shared";
import {
  measureM4aDuration,
  UnsupportedAudioError,
} from "../lib/audioDuration";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: createTempAudioStorage("uploads"),
  // busboy (multer's parser) flags the limit when a file *reaches* fileSize,
  // so +1 lets exactly 10 MB through and rejects anything bigger.
  limits: { fileSize: MAX_AUDIO_BYTES + 1, files: 1 },
});

/**
 * Receives the "audio" file and turns upload problems into JSON answers
 * instead of Express's default HTML error page. Any partial file has
 * already been deleted by the time we get here.
 */
const receiveAudio: RequestHandler = (req, res, next) => {
  upload.single("audio")(req, res, (err: unknown) => {
    if (!err) return next();

    // Client disconnected mid-upload: nobody is listening for an answer.
    if (req.socket.destroyed || res.headersSent) return;

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "file_too_large",
        message: "Audio files can be at most 10 MB.",
        maxBytes: MAX_AUDIO_BYTES,
      });
    }
    // File system errors (disk full, no permission) have a `syscall`.
    // Anything else is a bad request: wrong field name, two files, broken body...
    if (
      err instanceof multer.MulterError ||
      !(err as NodeJS.ErrnoException).syscall
    ) {
      return res.status(400).json({
        error: "invalid_upload",
        message:
          'Send the recording as a single file in the "audio" form field.',
      });
    }
    console.error("Saving upload failed", err);
    return res.status(500).json({
      error: "upload_failed",
      message: "Could not receive the recording. Please try again.",
    });
  });
};


type TranscribeRouterOptions = {
  /** Max cloud transcriptions per Pro account per UTC day. */
  dailyLimit: number;
};

type Outcome = {
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
};

const deleteTempFile = async (filePath: string) => {
  try {
    await fs.promises.rm(filePath, { force: true });
  } catch (err) {
    console.error("Failed to delete temp upload", filePath, err);
  }
};

/**
 * AAC encoders pad the start and end, so an honest 5-minute recording
 * measures slightly longer (e.g. 300.16 s). The grace keeps it from bouncing.
 */
const RECORDING_LENGTH_GRACE_SECONDS = 2;

/** Rejects recordings that are too long, or that we can't measure. null = fine. */
const checkRecordingLength = async (filePath: string): Promise<Outcome | null> => {
  let seconds: number;
  try {
    seconds = (await measureM4aDuration(filePath)).seconds;
  } catch (err) {
    if (err instanceof UnsupportedAudioError) {
      console.warn(`Rejected upload we can't measure: ${err.message}`);
      return {
        status: 415,
        body: {
          error: "unsupported_audio",
          message: "Send the recording as an .m4a file with AAC audio.",
        },
      };
    }
    console.error("Measuring recording length failed", err);
    return {
      status: 500,
      body: {
        error: "length_check_failed",
        message: "Could not check the recording. Please try again.",
      },
    };
  }

  if (seconds > MAX_RECORDING_SECONDS + RECORDING_LENGTH_GRACE_SECONDS) {
    return {
      status: 413,
      body: {
        error: "recording_too_long",
        message: `Recordings can be at most ${describeSeconds(MAX_RECORDING_SECONDS)}.`,
        maxSeconds: MAX_RECORDING_SECONDS,
      },
    };
  }
  return null;
};

const transcribeRecording = async (
  userId: string,
  filePath: string,
  dailyLimit: number,
): Promise<Outcome> => {
  // Before the daily limit: a rejected recording doesn't use up a transcription.
  const lengthProblem = await checkRecordingLength(filePath);
  if (lengthProblem) return lengthProblem;

  let reservation;
  try {
    reservation = await reserveCloudTranscription(userId, dailyLimit);
  } catch (err) {
    // Fail closed: if we can't count, we don't call OpenAI.
    console.error("Daily limit check failed", err);
    return {
      status: 503,
      body: {
        error: "limit_check_unavailable",
        message:
          "Cloud transcription is temporarily unavailable. Please try again shortly.",
      },
    };
  }

  if (!reservation.allowed) {
    const resetsAt = quotaResetsAt(reservation.usageDate);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetsAt.getTime() - Date.now()) / 1000),
    );
    return {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
      body: {
        error: "daily_limit_reached",
        message: `You've used all ${dailyLimit} cloud transcriptions for today. The limit resets at ${resetsAt.toISOString()} (midnight UTC).`,
        limit: dailyLimit,
        used: reservation.used,
        resetsAt: resetsAt.toISOString(),
      },
    };
  }

  try {
    const transcript = await transcribeAudio(filePath);
    return { status: 200, body: { message: transcript } };
  } catch (err) {
    console.error("OpenAI transcription failed", err);
    // No transcript for the user -> this attempt shouldn't count.
    try {
      await releaseCloudTranscription(userId, reservation.usageDate);
    } catch (releaseErr) {
      console.error(
        "Failed to give back daily transcription after OpenAI failure",
        releaseErr,
      );
    }
    return {
      status: 502,
      body: {
        error: "transcription_failed",
        message: "Cloud transcription failed. Please try again.",
      },
    };
  }
};

const createTranscribeRouter = ({ dailyLimit }: TranscribeRouterOptions) => {
  const transcribeRouter = Router();

  // 401/403 are decided in requirePremium, before anything is counted.
  transcribeRouter.post(
    "/",
    requirePremium,
    receiveAudio,
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      let outcome: Outcome;
      try {
        outcome = await transcribeRecording(
          res.locals.user.id,
          filePath,
          dailyLimit,
        );
      } finally {
        // Runs on every path -- success, 429, 503, 502 -- before the response is sent.
        await deleteTempFile(filePath);
      }
      if (outcome.status !== 200) {
        console.warn(
          `POST /transcribe -> ${outcome.status} ${outcome.body.error}`,
        );
      }


      if (outcome.headers) res.set(outcome.headers);
      res.status(outcome.status).json(outcome.body);
    },
  );

  return transcribeRouter;
};

export { createTranscribeRouter, MAX_AUDIO_BYTES };
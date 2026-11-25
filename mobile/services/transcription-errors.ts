import { describeSeconds } from "@voice-journal/shared";
// Why a cloud transcription failed.
// The error codes come from POST /transcribe in api/src/routes/transcribe.ts.

type CloudTranscriptionFailure =
  | { kind: "daily_limit"; limit?: number; retryAfterSeconds?: number }
  | { kind: "too_long"; maxSeconds?: number }
  | { kind: "too_large" }
  | { kind: "unreadable_audio" }
  | { kind: "service_unavailable" }
  | { kind: "network" }
  | { kind: "unknown" };

class CloudTranscriptionError extends Error {
  readonly failure: CloudTranscriptionFailure;

  constructor(failure: CloudTranscriptionFailure) {
    super(`Cloud transcription failed: ${failure.kind}`);
    this.name = "CloudTranscriptionError";
    this.failure = failure;
  }
}

const numberOrUndefined = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/** Turns an error response from POST /transcribe into a failure reason. */
const classifyErrorResponse = (
  status: number,
  retryAfter: string | null,
  body: unknown,
): CloudTranscriptionFailure => {
  const json = (body ?? {}) as Record<string, unknown>;

  switch (json.error) {
    case "daily_limit_reached":
      return {
        kind: "daily_limit",
        limit: numberOrUndefined(json.limit),
        retryAfterSeconds: retryAfter
          ? numberOrUndefined(Number(retryAfter))
          : undefined,
      };
    case "recording_too_long":
      return {
        kind: "too_long",
        maxSeconds: numberOrUndefined(json.maxSeconds),
      };
    case "file_too_large":
      return { kind: "too_large" };
    case "unsupported_audio":
      return { kind: "unreadable_audio" };
  }

  // No error code we know (e.g. an HTML error page from Render): go by status.
  if (status === 429) return { kind: "daily_limit" };
  if (status >= 500) return { kind: "service_unavailable" };
  return { kind: "unknown" };
};

/** 3725 -> "1 hour 3 minutes". Rounds up, so we never promise it sooner than it is. */
const describeWait = (seconds: number) => {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  if (minutes < 60) return describeSeconds(minutes * 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourText = `${hours} hour${hours === 1 ? "" : "s"}`;
  return rest ? `${hourText} ${describeSeconds(rest * 60)}` : hourText;
};

/** Title and message for the alert shown when a cloud transcription fails. */
const describeFailure = (
  failure: CloudTranscriptionFailure,
): { title: string; message: string } => {
  switch (failure.kind) {
    case "daily_limit": {
      if (failure.limit === 0) {
        // A limit of 0 is the API's off switch, not a used-up allowance.
        return {
          title: "Cloud transcription unavailable",
          message: "Cloud transcription is turned off at the moment.",
        };
      }
      const used = failure.limit
        ? `You've used all ${failure.limit} cloud transcriptions for today.`
        : "You've used all of today's cloud transcriptions.";
      const wait =
        failure.retryAfterSeconds !== undefined
          ? `You can use it again in ${describeWait(failure.retryAfterSeconds)}.`
          : "You can use it again once the daily limit resets.";
      return { title: "Daily limit reached", message: `${used} ${wait}` };
    }
    case "too_long":
      return {
        title: "Recording too long",
        message: failure.maxSeconds
          ? `Recordings can be at most ${describeSeconds(failure.maxSeconds)} long.`
          : "This recording is longer than cloud transcription allows.",
      };
    case "too_large":
      return {
        title: "Recording too large",
        message: "Recordings can be at most 10 MB.",
      };
    case "unreadable_audio":
      return {
        title: "Couldn't read the recording",
        message: "We couldn't read the audio in this recording.",
      };
    case "service_unavailable":
      return {
        title: "Cloud transcription unavailable",
        message: "Cloud transcription isn't working at the moment.",
      };
    case "network":
      return {
        title: "No connection",
        message:
          "We couldn't reach the server. Check your internet connection before your next recording.",
      };
    case "unknown":
      return {
        title: "Transcription failed",
        message: "Something went wrong while transcribing your recording.",
      };
  }
};

export { CloudTranscriptionError, classifyErrorResponse, describeFailure };
export type { CloudTranscriptionFailure };

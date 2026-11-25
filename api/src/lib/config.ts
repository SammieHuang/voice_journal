const DAILY_LIMIT_ENV = "PRO_DAILY_CLOUD_TRANSCRIPTION_LIMIT";
const DEFAULT_DAILY_LIMIT = 30;
const PG_INT_MAX = 2147483647;

/**
 * Max cloud transcriptions per Pro account per UTC day.
 * Unset/empty -> 30. 0 turns cloud transcription off for everyone.
 * Anything else that isn't a whole number throws, so a typo in Render's env
 * settings stops the API from starting instead of silently removing the cap.
 */
const getProDailyTranscriptionLimit = (): number => {
  const raw = process.env[DAILY_LIMIT_ENV]?.trim();

  if (!raw) {
    return DEFAULT_DAILY_LIMIT;
  }

  const value = Number(raw);
  if (!/^\d+$/.test(raw) || value > PG_INT_MAX) {
    throw new Error(
      `${DAILY_LIMIT_ENV} must be a whole number between 0 and ${PG_INT_MAX}, got "${raw}"`,
    );
  }

  return value;
};

export {getProDailyTranscriptionLimit, DAILY_LIMIT_ENV, DEFAULT_DAILY_LIMIT}

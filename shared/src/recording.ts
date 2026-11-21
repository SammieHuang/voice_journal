/**
 * Longest recording allowed, in seconds. The app stops recording here and
 * the API rejects anything longer. Change it here only -- it needs both an
 * API deploy and a new app build.
 */
export const MAX_RECORDING_SECONDS = 5 * 60;

/** How a length is worded to users, e.g. 300 -> "5 minutes". */
export const describeSeconds = (seconds: number): string => {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  return `${seconds} second${seconds === 1 ? "" : "s"}`;
};

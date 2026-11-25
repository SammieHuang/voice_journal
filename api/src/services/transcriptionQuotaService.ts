import { supabaseAdmin } from "../lib/supabase";

type QuotaReservation = {
  allowed: boolean;
  used: number;
  /** UTC day that was charged, "YYYY-MM-DD". Use this same day when giving the transcription back. */
  usageDate: string;
};

/**
 * Atomically takes one cloud transcription from the account's allowance for
 * today (UTC). Throws if the database call fails -- callers must treat that as
 * "not allowed" so an outage can't turn into unlimited OpenAI spend.
 */
const reserveCloudTranscription = async (
  userId: string,
  limit: number,
): Promise<QuotaReservation> => {
  const { data, error } = await supabaseAdmin.rpc(
    "consume_cloud_transcription",
    {
      p_user_id: userId,
      p_limit: limit,
    },
  );

  if (error) {
    throw new Error(`consume_cloud_transcription failed: ${error.message}`);
  }
  if (
    !data ||
    typeof data.allowed !== "boolean" ||
    typeof data.used !== "number" ||
    typeof data.usage_date !== "string"
  ) {
    throw new Error(
      `consume_cloud_transcription returned unexpected data: ${JSON.stringify(data)}`,
    );
  }

  return { allowed: data.allowed, used: data.used, usageDate: data.usage_date };
};

/** Gives back (refunds) one transcription for the given day, e.g. when the OpenAI call failed. */
const releaseCloudTranscription = async (
  userId: string,
  usageDate: string,
): Promise<void> => {
  const { error } = await supabaseAdmin.rpc("release_cloud_transcription", {
    p_user_id: userId,
    p_usage_date: usageDate,
  });

  if (error) {
    throw new Error(`release_cloud_transcription failed: ${error.message}`);
  }
};

/** Next UTC midnight after the given "YYYY-MM-DD" usage day. */
const quotaResetsAt = (usageDate: string): Date => {
  const reset = new Date(`${usageDate}T00:00:00.000Z`);
  reset.setUTCDate(reset.getUTCDate() + 1);
  return reset;
};

export { reserveCloudTranscription, releaseCloudTranscription, quotaResetsAt };
export type { QuotaReservation };
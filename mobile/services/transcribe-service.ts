import { File } from "expo-file-system";
import { supabase } from "./supabase";
import {
  CloudTranscriptionError,
  classifyErrorResponse,
} from "./transcription-errors";

/** Cloud transcription. Every failure is thrown as a CloudTranscriptionError. */
async function transcribeAudio(uri: string): Promise<string> {
  const formData = new FormData();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const audioFile = new File(uri);
  formData.append("audio", audioFile, "recording.m4a");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });
  } catch {
    // fetch only throws when no response arrived at all: offline, or server unreachable.
    throw new CloudTranscriptionError({ kind: "network" });
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Not JSON (e.g. an HTML error page from Render): classify by status alone.
    }
    throw new CloudTranscriptionError(
      classifyErrorResponse(
        response.status,
        response.headers.get("Retry-After"),
        body,
      ),
    );
  }

  const data = await response.json();
  if (typeof data?.message !== "string") {
    throw new CloudTranscriptionError({ kind: "unknown" });
  }
  return data.message;
}

export { transcribeAudio };

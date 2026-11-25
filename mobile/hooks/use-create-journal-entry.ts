/** @format */

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  type RecordingStatus,
} from "expo-audio";
import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { RecordStatusTypes } from "@/types/types";
import { useTranscription } from "./use-transcription";
import { requireAuth } from "@/services/auth-service";
import { MAX_RECORDING_SECONDS, describeSeconds } from "@voice-journal/shared";
import { getTodayJournal } from "@/services/journal-service";
import {
  CloudTranscriptionError,
  describeFailure,
} from "@/services/transcription-errors";

export default function useCreateJournalEntry() {
  // expo-audio registers the listener below only once, so it must use only
  // refs and state setters -- state values read in there would be stale.

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordStatus, setRecordStatus] = useState<RecordStatusTypes>("idle");
  const recordingStartedAt = useRef<number | null>(null);
  const stopRequested = useRef(false);

  const handleRecorderStatus = (status: RecordingStatus) => {
    if (!status.isFinished) return;
    // The user tapped Stop: stopRecording() takes care of that.
    if (stopRequested.current || recordingStartedAt.current === null) return;

    const elapsedMs = Date.now() - recordingStartedAt.current;
    recordingStartedAt.current = null;

    // iOS stopped it with no usable file: start over.
    if (status.hasError || !status.url) {
      setRecordStatus("idle");
      Alert.alert(
        "Recording stopped",
        "Something interrupted the recording. Please try again.",
      );
      return;
    }

    setRecordStatus("readyToTranscribe");
    setAudioUri(status.url);

    // iOS can also end a recording early (e.g. a phone call).
    // Only mention the limit when that's really why it stopped.
    if (elapsedMs >= (MAX_RECORDING_SECONDS - 1) * 1000) {
      Alert.alert(
        "Recording stopped",
        `Recordings can be up to ${describeSeconds(MAX_RECORDING_SECONDS)} long, so this one stopped automatically. You can transcribe what you recorded.`,
      );
    }
  };

  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
    handleRecorderStatus,
  );

  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const { isReady, transcribe } = useTranscription();

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync();
  });

  const startRecording = async () => {
    setAudioUri(null);

    const sessionUser = await requireAuth();
    if (!sessionUser) {
      alert("Please log in to save your journal");
      router.push("/profile");
      return;
    }

    const permission = await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      alert("Microphone permission denied");
      console.log("Microphone permission denied");
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();

    stopRequested.current = false;
    recordingStartedAt.current = Date.now();
    // Every recording (free and Pro) stops by itself at the shared limit.
    recorder.record({ forDuration: MAX_RECORDING_SECONDS });
    setRecordStatus("recording");
  };

  const stopRecording = async () => {
    if (recordStatus !== "recording") return;
    stopRequested.current = true;
    recordingStartedAt.current = null;
    await recorder.stop();

    setRecordStatus("readyToTranscribe");
    setAudioUri(recorder.uri);
  };

  // Cloud transcription failed: drop the recording, say why, then open
  // today's journal (or a new one) in edit mode so the user can type instead.
  const handleCloudFailure = async (err: CloudTranscriptionError) => {
    const { title, message } = describeFailure(err.failure);

    let todayJournalId: string | null = null;
    try {
      todayJournalId = (await getTodayJournal())?.id ?? null;
    } catch (lookupErr) {
      // e.g. offline too: open a new journal instead.
      console.log("Couldn't look up today's journal", lookupErr);
    }

    resetEntry();

    const whatNext = todayJournalId
      ? "The recording was discarded. Today's journal will open so you can type your entry instead."
      : "The recording was discarded. A new journal will open so you can type your entry instead.";

    Alert.alert(
      title,
      `${message}\n\n${whatNext}`,
      [
        {
          text: "OK",
          onPress: () =>
            todayJournalId
              ? router.push({
                  pathname: "/journal/[id]",
                  params: { id: todayJournalId, mode: "edit" },
                })
              : router.push({
                  pathname: "/journal/[id]",
                  params: { id: "new" },
                }),
        },
      ],
      { cancelable: false },
    );
  };

  const startTranscribe = async () => {
    if (!audioUri || isTranscribing) return;
    if (!isReady) {
      alert("Transcription is still loading, try again in a moment");
      return;
    }
    try {
      setIsTranscribing(true);
      setRecordStatus("transcribing");
      const text = await transcribe(audioUri);

      setTranscript(text);
      setRecordStatus("preview");
    } catch (err) {
      console.log(err);
      if (err instanceof CloudTranscriptionError) {
        await handleCloudFailure(err);
      } else {
        // On-device transcription failed: unchanged, the user can try again.
        setRecordStatus("readyToTranscribe");
      }
    } finally {
      setIsTranscribing(false);
    }
  };
  const resetEntry = () => {
    setAudioUri(null);
    setTranscript(null);
    setRecordStatus("idle");
    setIsTranscribing(false);
  };

  return {
    audioUri,
    recordStatus,
    transcript,
    startRecording,
    stopRecording,
    startTranscribe,
    resetEntry,
  };
}

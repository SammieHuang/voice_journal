/** @format */

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import { useState } from "react";
import { RecordStatusTypes } from "@/types/types";
import { transcribeAudio } from "@/services/api";

export default function useCreateJournalEntry() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordStatus, setRecordStatus] = useState<RecordStatusTypes>('idle')
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  const startRecording = async () => {
    setAudioUri(null)
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

    recorder.record();
    setRecordStatus("recording");
  };

  const stopRecording = async () => {
    if (recordStatus !== 'recording') return;
    await recorder.stop();

    setRecordStatus('readyToTranscribe')
    setAudioUri(recorder.uri);
  };

const startTranscribe = async () => {
    if (!audioUri || isTranscribing) return;
    try {
      setIsTranscribing(true);
      setRecordStatus("transcribing");
      const text = await transcribeAudio(audioUri);
      
      setTranscript(text);  
      setRecordStatus("preview");
      
    } catch (err) {
      console.log(err);
      setRecordStatus("readyToTranscribe");
    } finally {
      setIsTranscribing(false);
    }
  }

  return {
    audioUri,
    recordStatus,
    transcript,
    startRecording,
    stopRecording,
    startTranscribe
  };
}

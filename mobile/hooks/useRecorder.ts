/** @format */

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import { useState } from "react";

export default function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

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
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    await recorder.stop();

    setIsRecording(false);
    setAudioUri(recorder.uri);
  };

  return { isRecording, audioUri, startRecording, stopRecording };
}

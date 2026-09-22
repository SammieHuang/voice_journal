/** @format */

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { RecordStatusTypes } from "@/types/types";
import { useTranscription } from "./use-transcription";
import { requireAuth} from "@/services/auth-service";

export default function useCreateJournalEntry() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordStatus, setRecordStatus] = useState<RecordStatusTypes>('idle')
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const { isReady, transcribe } = useTranscription()

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync()
  }, )

  const startRecording = async () => {
    setAudioUri(null)

    const sessionUser = await requireAuth()
    if (!sessionUser) {
      alert('Please log in to save your journal')
      router.push("/profile")
      return
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
    })
    await recorder.prepareToRecordAsync()
    
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
    if (!isReady) {
      alert('Transcription is still loading, try again in a moment')
      return
    }
      try {
        setIsTranscribing(true);
        setRecordStatus("transcribing");
        const text = await transcribe(audioUri);
        
        setTranscript(text);  
        setRecordStatus("preview");
        
      } catch (err) {
        console.log(err);
        setRecordStatus("readyToTranscribe");
      } finally {
        setIsTranscribing(false);
      }
  }
  const resetEntry = () => {
    setAudioUri(null)
    setTranscript(null)
    setRecordStatus('idle')
    setIsTranscribing(false)
  }

  return {
    audioUri,
    recordStatus,
    transcript,
    startRecording,
    stopRecording,
    startTranscribe,
    resetEntry
  };
}

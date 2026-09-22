/** @format */

import { useRef, useState } from "react";
import { Text, Pressable, StyleSheet, ScrollView } from "react-native";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import { transcribeAudio } from "@/services/transcribe-service";

export default function SpikeTranscribeCloudScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [metrics, setMetrics] = useState<{
    recordMs?: number;
    transcribeMs?: number;
  }>({});

  const recordStartRef = useRef(0);

  const startRecording = async () => {
    setTranscript("");
    setMetrics({});

    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) return;

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();

    recordStartRef.current = Date.now();
    recorder.record();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await recorder.stop();
    setIsRecording(false);
    const recordMs = Date.now() - recordStartRef.current;

    if (!recorder.uri) return;

    setIsTranscribing(true);
    const transcribeStart = Date.now();
    try {
      const text = await transcribeAudio(recorder.uri);
      const transcribeMs = Date.now() - transcribeStart;
      setTranscript(text);
      setMetrics({ recordMs, transcribeMs });
    } catch (err) {
      setTranscript(`(error: ${String(err)})`);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cloud Transcribe Spike</Text>

      <Pressable
        style={[styles.button, isRecording && styles.buttonActive]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
      >
        <Text style={styles.buttonText}>
          {isTranscribing ? "Transcribing..." : isRecording ? "Stop" : "Record"}
        </Text>
      </Pressable>

      {metrics.recordMs != null && (
        <Text style={styles.metrics}>
          recorded {metrics.recordMs}ms · transcribed in {metrics.transcribeMs}
          ms
        </Text>
      )}

      <Text style={styles.transcript}>{transcript}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  button: {
    backgroundColor: "#333",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonActive: { backgroundColor: "#9B3D30" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  metrics: { fontSize: 12, color: "#999" },
  transcript: { fontSize: 16, marginTop: 8 },
});

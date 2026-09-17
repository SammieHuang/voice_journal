/** @format */

import { useRef, useState } from "react";
import { Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { AudioManager, AudioRecorder } from "react-native-audio-api";
import { useSpeechToText, models } from "react-native-executorch";

export default function SpikeTranscribeScreen() {
  const stt = useSpeechToText(models.speechToText.WHISPER.EN.TINY.DEFAULT);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [metrics, setMetrics] = useState<{
    recordMs?: number;
    transcribeMs?: number;
  }>({});

  const recorderRef = useRef<AudioRecorder | null>(null);
  const samplesRef = useRef<number[]>([]);
  const recordStartRef = useRef(0);

  const startRecording = async () => {
    samplesRef.current = [];
    setTranscript("");
    setMetrics({});

    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorder();
    }

    AudioManager.setAudioSessionOptions({
      iosCategory: "playAndRecord",
      iosMode: "spokenAudio",
    });
    await AudioManager.setAudioSessionActivity(true);

    recorderRef.current.onAudioReady(
      { sampleRate: 16000, bufferLength: 1600, channelCount: 1 },
      ({ buffer }) => {
        samplesRef.current.push(...Array.from(buffer.getChannelData(0)));
      },
    );

    recordStartRef.current = Date.now();
    await recorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;
    await recorderRef.current.stop();
    await AudioManager.setAudioSessionActivity(false);
    setIsRecording(false);

    const recordMs = Date.now() - recordStartRef.current;

    if (!stt.transcribe) {
      setTranscript("(model not ready yet)");
      return;
    }

    const audio = Float32Array.from(samplesRef.current);
    const transcribeStart = Date.now();
    const text = await stt.transcribe(audio, { language: "en" });
    const transcribeMs = Date.now() - transcribeStart;

    setTranscript(text);
    setMetrics({ recordMs, transcribeMs });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ExecuTorch Spike</Text>

      <Text style={styles.status}>
        Model:{" "}
        {stt.isReady
          ? "ready"
          : `loading ${Math.round((stt.downloadProgress ?? 0) * 100)}%`}
      </Text>
      {stt.error && (
        <Text style={styles.error}>Model error: {String(stt.error)}</Text>
      )}

      <Pressable
        style={[styles.button, isRecording && styles.buttonActive]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!stt.isReady}
      >
        <Text style={styles.buttonText}>{isRecording ? "Stop" : "Record"}</Text>
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
  status: { fontSize: 14, color: "#666" },
  error: { color: "red" },
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

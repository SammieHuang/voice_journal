import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import useRecorder from "@/hooks/useRecorder";
import { transcribeAudio } from "@/services/api";

export default function NewScreen() {

  const { isRecording, audioUri, startRecording, stopRecording } = useRecorder()
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false)
  

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8F1DD",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          fontFamily: "SpecialElite_400Regular",
          fontSize: 32,
          color: "#3D3125",
        }}
      >
        New Entry
      </Text>
      <Pressable
        style={{
          marginTop: 60,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: isRecording ? "#9B3D30" : "#55624F",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={{ color: "#F8F1DD", fontSize: 18 }}>
          {isRecording ? "Stop" : "Record"}
        </Text>
      </Pressable>
      {audioUri && (
        <Pressable
          onPress={async () => {
            if (!audioUri || isTranscribing) return;

            try {
              setIsTranscribing(true)
              const text = await transcribeAudio(audioUri)
              setTranscript(text)
            } catch (err) {
              console.log(err)
            } finally {
              setIsTranscribing(false)
              }
          }}
          style={{
            marginTop: 24,
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 999,
            backgroundColor: "#8A6F4D",
          }}
        >
          <Text style={{ color: "#F8F1DD", fontSize: 16 }}>Transcribe</Text>
        </Pressable>
      )}
    </View>
  );
}

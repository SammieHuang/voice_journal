import { Pressable, Text, StyleSheet, ViewStyle} from "react-native";
import { RecordStatusTypes } from "@/types/types";

type RecordButtonProps = {
  recordStatus: RecordStatusTypes
  onPress: () => Promise<void>
}
const LABELS: Record<RecordStatusTypes, string> = {
  idle: "Record",
  recording: "Stop",
  readyToTranscribe: "Transcribe",
  transcribing: "Transcribing...",
  preview: "Save",
};

const baseButton: ViewStyle = {
  marginTop: 60,
  width: 120,
  height: 120,
  borderRadius: 60,
  justifyContent: "center",
  alignItems: "center",
};

const RecordButton = ({ recordStatus, onPress }: RecordButtonProps) => {

    return (
      <Pressable
        style={styles[recordStatus]}
        onPress = {onPress}
      >
            <Text style={styles.text}>{LABELS[recordStatus]} </Text>
        </Pressable>
    )
}

export const styles = StyleSheet.create({
  recording: {
    ...baseButton,
    backgroundColor: "#9B3D30",
  },
  idle: {
    ...baseButton,
    backgroundColor: "#55624F",
  },
  readyToTranscribe: {
    ...baseButton,
    backgroundColor: "#8A6F4D",
  },
  transcribing: {
    ...baseButton,
    backgroundColor: "#A29A87",
  },
  preview: {
    ...baseButton,
    backgroundColor: "#55624F",
  },
  text: {
    color: "#F8F1DD",
    fontSize: 18,
  },
});

export default RecordButton
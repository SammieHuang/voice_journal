import { StyleSheet,Pressable, Text } from "react-native";
import { fonts } from "@/constants/theme";

type JournalViewerProps = {
    onLongPress: () => void,
    transcript?: string
}

export function JournalViewer({onLongPress, transcript}: JournalViewerProps) {
    return (
        <Pressable
          onLongPress={() => onLongPress()}
          style={styles.readArea}
        >
        <Text
          style={styles.transcript}
        >
            {transcript || "No transcript"}
        </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
  readArea: {
    flex: 1,
    padding: 24,
  },
  transcript: {
    color: "#3D3125",
    fontFamily: fonts.journal,
    fontSize: 22,
    lineHeight: 32,
  },
});
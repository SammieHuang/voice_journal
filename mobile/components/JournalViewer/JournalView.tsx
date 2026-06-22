import { StyleSheet, View, Pressable, Text } from "react-native";

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
    fontSize: 20,
    lineHeight: 32,
  },
});
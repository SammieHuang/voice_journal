import { StyleSheet, Pressable, Text } from "react-native";
import { Typography } from "../ui";
import { theme } from "@/design-system";
import { fonts } from "@/constants/theme";

type JournalViewerProps = {
    onLongPress: () => void,
    transcript?: string
}

export function JournalViewer({onLongPress, transcript}: JournalViewerProps) {
    return (
      <Pressable onLongPress={() => onLongPress()} style={styles.readArea}>
        <Typography variant="journal">
          {transcript || "No transcript"}
        </Typography>
      </Pressable>
    );
}

const styles = StyleSheet.create({
  readArea: {
    flex: 1,
    padding: theme.spacing.xxl,
  },
});
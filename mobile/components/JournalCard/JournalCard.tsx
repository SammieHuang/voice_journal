import { Pressable, StyleSheet, Text, View } from "react-native";
import { Journal } from "@/types/journal";
import { Surface, Typography } from "@/components/ui";
import { theme } from "@/design-system";


type journalCardProps = {
  journal: Journal;
  onPress: () => void;
};

function JournalCard({ journal, onPress }: journalCardProps) {
  const date = new Date(journal.createdAt).toLocaleDateString();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Surface style={styles.card}>
        <View style={styles.header}>
          <Typography variant="caption">{date}</Typography>
          <Typography variant="caption" style={styles.chevron}>
            ›
          </Typography>
        </View>

        <Typography variant="body" numberOfLines={3}>
          {journal.transcript || "No transcript"}
        </Typography>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm + 2,
  },
  chevron: {
    fontSize: 28,
    lineHeight: 28,
  },
});

export { JournalCard };
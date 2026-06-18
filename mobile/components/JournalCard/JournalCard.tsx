import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Journal } from "@/types/journal";

type journalCardProps = {
  journal: Journal;
  onPress: () => void;
};

function JournalCard({ journal, onPress }: journalCardProps) {
  const date = new Date(journal.createdAt).toLocaleDateString();
  return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.header}>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>

        <Text style={styles.transcript} numberOfLines={3}>
          {journal.transcript || "No transcript"}
        </Text>
      </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF8E8",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(138,111,77,0.12)",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  date: {
    color: "#8A6F4D",
    fontSize: 14,
  },
  chevron: {
    color: "#8A6F4D",
    fontSize: 28,
    lineHeight: 28,
  },
  transcript: {
    color: "#3D3125",
    fontSize: 16,
    lineHeight: 24,
  },
  rightAction: { width: 50, height: 50, backgroundColor: "purple" },
  separator: {
    width: "100%",
    borderTopWidth: 1,
  },
  swipeable: {
    height: 50,
    backgroundColor: "papayawhip",
    alignItems: "center",
  },
});

export {JournalCard}

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList} from "react-native";
import { getJournals } from "@/services/journal-service";
import { Journal } from "@/types/journal";
import { JournalCard } from "@/components/JournalCard/JournalCard";

export default function JournalsScreen() {
  const [journals, setJournals] = useState<Journal[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadJournals = async () => {
        const savedJournals = await getJournals();
        setJournals(savedJournals);
      };

      loadJournals();
    }, []),
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Journals</Text>

      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No journals yet.</Text>
        }
        renderItem={({ item }) => (
          <JournalCard
            onPress={() => router.push(`/journal/${item.id}`)}
            journal={item}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F1DD",
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 32,
    color: "#3D3125",
    marginBottom: 24,
  },
  emptyText: {
    color: "#8A6F4D",
    fontSize: 18,
    textAlign: "center",
    marginTop: 80,
  },
  card: {
    backgroundColor: "#FFF8E8",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  date: {
    color: "#8A6F4D",
    fontSize: 14,
    marginBottom: 8,
  },
  transcript: {
    color: "#3D3125",
    fontSize: 16,
    lineHeight: 24,
  },
});

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { deleteJournal, getCloudJournals, getLocalJournals } from "@/services/journal-service";
import { Journal } from "@/types/journal";
import { JournalCard } from "@/components/JournalCard/JournalCard";

export default function JournalsScreen() {
  const [journals, setJournals] = useState<Journal[]>([]);

  const handleDelete = async (id: string) => {
    await deleteJournal(id)
    setJournals(journals=>journals.filter(journal=>journal.id !== id))
  }
  const renderRightAction = (id: string) => {
    return (
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={()=>router.push(`/journal/${id}/edit`)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={()=>handleDelete(id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>
    );
  }

  useFocusEffect(
    useCallback(() => {
      const loadJournals = async () => {
        try {
          const localJournals = await getLocalJournals()
          setJournals(localJournals)

          const cloudJournals = await getCloudJournals()
          setJournals(cloudJournals)
        } catch (err) {
          console.log(`Failed to load journals`, err)
        }

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
          <Swipeable renderRightActions={()=>renderRightAction(item.id)}>
            <JournalCard
              onPress={() => router.push(`/journal/${item.id}`)}
              journal={item}
            />
          </Swipeable>
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
  actions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  actionButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor:"#C8B08A",
  },
  deleteButton: {
    backgroundColor: "#C95C4A",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  actionText: {
    color: "white",
    fontWeight: "700",
  },
});

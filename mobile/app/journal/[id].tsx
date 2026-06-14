import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { router, useLocalSearchParams } from "expo-router";
import { Journal } from "@/types/journal";
import { Ionicons } from "@expo/vector-icons";
import { getJournalById } from "@/services/journal-service";

export default function JournalDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [journal, setJournal] = useState<Journal | null>(null)

    useEffect(() => {
        if (!id) return 
        
        const loadJournal = async () => {
            const savedJournal = await getJournalById(String(id))
            setJournal(savedJournal)
        }

        loadJournal()
    }, [id])

    if (!journal) {
        return (
            <View style={styles.screen}>
                <Text style={styles.title}>Journal not found</Text>
            </View>
        )
    }

    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#8A6F4D" />
          <Text style={styles.backText}>Journals</Text>
        </Pressable>
        <Text style={styles.date}>
          {new Date(journal.createdAt).toLocaleDateString()}
        </Text>

        <Text style={styles.transcript}>{journal.transcript}</Text>
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F1DD",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 88,
    paddingBottom: 120,
  },
  title: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 28,
    color: "#3D3125",
    textAlign: "center",
    marginTop: 120,
  },
  date: {
    color: "#8A6F4D",
    fontSize: 16,
    marginBottom: 24,
  },
  transcript: {
    color: "#3D3125",
    fontSize: 20,
    lineHeight: 32,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },

  backText: {
    color: "#8A6F4D",
    fontSize: 18,
    marginLeft: 4,
    fontFamily: "SpecialElite_400Regular",
  },
});
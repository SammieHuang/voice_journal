import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams } from "expo-router";
import { Journal } from "@/types/journal";
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
});
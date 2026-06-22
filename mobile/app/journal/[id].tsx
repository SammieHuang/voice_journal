/** @format */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Journal } from "@/types/journal";
import { Ionicons } from "@expo/vector-icons";
import {
  getJournalById,
  updateJournalTranscript,
  deleteJournal,
  saveJournal
} from "@/services/journal-service";
import { JournalEditor } from "@/components/JournalEditor/JournalEditor";
import { JournalViewer } from "@/components/JournalViewer/JournalView";

export default function JournalDetailScreen() {
  const { id, mode, transcript } = useLocalSearchParams<{
    id: string;
    mode?: string;
    transcript?: string
  }>();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit');
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [draft, setDraft] = useState('')
  const isNew = id === 'new'

  const handleCancel = () => {
    setDraft(journal?.transcript ?? '')
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!id || !draft.trim()) return;

    try {
      setIsSaving(true)

      if (isNew) {
        const savedJournal = await saveJournal(draft)
        router.replace(`/journal/${savedJournal.id}`)
      }

      const updatedJournal = await updateJournalTranscript(String(id), draft)

      setJournal(updatedJournal)
      setDraft(updatedJournal.transcript ?? "")
      setIsEditing(false);
      
    } catch (err) {
      console.log('Failed to update journal', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return;

    if (isNew) {
      router.replace('/')
      return
    }

    await deleteJournal(String(id))
    router.replace("/")
  }

  useEffect(() => {
    if (!id) return;

    if (isNew) {
      const initialTranscript = transcript ?? ""
      setJournal({
        id: 'new',
        createdAt: new Date().toISOString(),
        transcript:initialTranscript
      })
      setDraft(initialTranscript)
      setIsEditing(true)
      return;
    }


    const loadJournal = async () => {
      const savedJournal = await getJournalById(String(id));
      setJournal(savedJournal);
      setDraft(savedJournal?.transcript ?? '')
    };

    loadJournal();
  }, [id, transcript, isNew]);

  if (!journal) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Journal not found</Text>
      </View>
    );
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

      {isEditing ?
        (<JournalEditor
          draft={draft}
          onChangeDraft={setDraft}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          isSaving={isSaving}
        />) :
        (<JournalViewer
            onLongPress={() => setIsEditing(true)}
            transcript={draft}
          />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F1DD",
  },
  content: {
    flexGrow: 1,
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

/** @format */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Journal } from "@/types/journal";
import {
  getJournalById,
  updateJournalTranscript,
  deleteJournal,
  saveJournal
} from "@/services/journal-service";
import { JournalHeader, JournalScreenContent } from "@/components";

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
        return
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
      <JournalHeader
        onBack={() => router.replace("/")}
        createdAt = {journal?.createdAt}
      />

      <JournalScreenContent
        draft={draft}
        isEditing={isEditing}
        isSaving={isSaving}
        onChangeDraft={setDraft}
        onStartEditing={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
        onDelete={handleDelete}
      />
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

});

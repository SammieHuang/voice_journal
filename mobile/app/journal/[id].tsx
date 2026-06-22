/** @format */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Journal } from "@/types/journal";
import { Ionicons } from "@expo/vector-icons";
import {
  getJournalById,
  updateJournalTranscript,
  deleteJournal
} from "@/services/journal-service";

export default function JournalDetailScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit');
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [draft, setDraft] = useState('')

  const handleCancel = () => {
    setDraft(journal?.transcript ?? '')
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!id || !draft.trim()) return;

    try {
      setIsSaving(true)

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

    await deleteJournal(String(id))
    router.replace("/")
  }

  useEffect(() => {
    if (!id) return;

    const loadJournal = async () => {
      const savedJournal = await getJournalById(String(id));
      setJournal(savedJournal);
      setDraft(savedJournal?.transcript ?? '')
    };

    loadJournal();
  }, [id]);

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

      {isEditing ? (
        <View>
          <TextInput
            style={styles.input}
            defaultValue={draft}
            onChangeText={setDraft}
            textAlignVertical="top"
            multiline
            autoCorrect={false}
          />
          <View style={styles.editActions}>
            <Pressable onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              disabled={isSaving}
            >
              <Text style={styles.saveText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ) : (
          <Pressable
            onLongPress={() => setIsEditing(true)}
            style={styles.readArea}
          >
          <Text style={styles.transcript}>{journal.transcript}</Text>
        </Pressable>
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
  input: {
    minHeight: 320,
    color: "#3D3125",
    fontSize: 20,
    lineHeight: 32,
    backgroundColor: "#FFF8E8",
    borderRadius: 20,
    padding: 20,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelText: {
    color: "#8A6F4D",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#3D3125",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#C95C4A",
  },
  deleteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  readArea: {
    flex: 1,
    backgroundColor: "#FFF8E8",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(138,111,77,0.12)",
  },
});

/** @format */
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { JournalViewer, JournalEditor } from "@/components/index";

type JournalScreenContentProps = {
  isEditing: boolean;
  draft: string;
  isSaving: boolean;
  onChangeDraft: () => void;
  onStartEditing: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
};

export default function JournalScreenContent(props: JournalScreenContentProps) {
  const {
    isEditing,
    draft,
    isSaving,
    onChangeDraft,
    onStartEditing,
    onCancel,
    onSave,
    onDelete,
  } = props;

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
        <JournalEditor
          draft={draft}
          onChangeDraft={onChangeDraft}
          onCancel={onCancel}
          onSave={onSave}
          onDelete={onDelete}
          isSaving={isSaving}
        />
      ) : (
        <JournalViewer
          onLongPress={() => setIsEditing(true)}
          transcript={journal.transcript}
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

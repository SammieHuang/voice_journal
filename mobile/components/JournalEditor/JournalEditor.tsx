/** @format */

import { StyleSheet, Text, TextInput, Pressable, View } from "react-native";

type JournalEditorProps = {
  draft: string;
  onChangeDraft: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
};

export function JournalEditor({
  draft,
  onChangeDraft,
  onCancel,
  onSave,
  onDelete,
  isSaving,
}: JournalEditorProps) {
  return (
    <View>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={onChangeDraft}
        textAlignVertical="top"
        multiline
        autoCorrect={false}
      />

      <View style={styles.editActions}>
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>

        <View style={styles.rightActions}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={onSave}
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            disabled={isSaving}
          >
            <Text style={styles.saveText}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  rightActions: {
    flexDirection: "row",
    gap: 12,
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
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
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
  disabledButton: {
    opacity: 0.6,
  },
});

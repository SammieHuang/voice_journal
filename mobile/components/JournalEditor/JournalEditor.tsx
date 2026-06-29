/** @format */

import { StyleSheet, TextInput, View } from "react-native";
import { Button } from "@/components/ui";
import { theme } from "@/design-system";

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
        <Button onPress={onDelete} variant="danger">
          Delete
        </Button>
        <View style={styles.rightActions}>
          <Button onPress={onCancel} variant="ghost">
            Cancel
          </Button>
          <Button onPress={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 320,
    color: theme.colors.textWarm,
    fontSize: 20,
    lineHeight: 32,
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  rightActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
});

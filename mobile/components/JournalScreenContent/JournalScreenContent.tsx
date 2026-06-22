import { JournalViewer, JournalEditor } from "@/components/index";

type JournalScreenContentProps = {
  isEditing: boolean;
  draft: string;
  isSaving: boolean;
  onChangeDraft: (text: string) => void;
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

  return isEditing ? (
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
      transcript={draft}
      onLongPress={onStartEditing}
    />
  );
}
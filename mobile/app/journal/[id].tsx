import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Journal } from "@/types/journal";
import {
  useSaveJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation
} from "@/hooks/use-journal-mutations";
import { JournalHeader, JournalScreenContent } from "@/components";
import { useJournalQuery } from "@/hooks/use-journals-query";

export default function JournalDetailScreen() {
  const { id, mode, transcript } = useLocalSearchParams<{
    id: string;
    mode?: string;
    transcript?: string
  }>();

  const isNew = id === "new";

  const journalQuery = useJournalQuery(String(id))
  const saveJournalMutation = useSaveJournalMutation()
  const updateJournalMutation = useUpdateJournalMutation()
  const deleteJournalMutation = useDeleteJournalMutation()

  const journal = isNew ? null : journalQuery.data

  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit' || isNew);
  const [draft, setDraft] = useState(isNew ? transcript ?? '' : '')
  const [newCreatedAt] = useState(()=>new Date().toISOString())
  
  useEffect(() => {
    if (!isNew && journalQuery.data) {
      setDraft(journalQuery.data.transcript ?? "");
    }
  }, [isNew, journalQuery.data?.id]);

  const handleCancel = () => {
    setDraft(journal?.transcript ?? '')
    setIsEditing(false)
  }
const handleSave = () => {
  if (!id || !draft.trim()) return;

  if (isNew) {
    saveJournalMutation.mutate(draft, {
      onSuccess: (savedJournal) => {
        if (!savedJournal) {
          Alert.alert("You need to login to save");
          router.replace("/profile");
          return;
        }
        router.replace(`/journal/${savedJournal.id}`);
      },
    });
    return;
  }

  updateJournalMutation.mutate(
    { id: String(id), transcript: draft },
    {
      onSuccess: (updatedJournal) => {
        setDraft(updatedJournal.transcript ?? "");
        setIsEditing(false);
      },
    },
  );
};



  const handleDelete =  () => {
    if (!id) return;

    if (isNew) {
      router.replace('/')
      return
    }

    deleteJournalMutation.mutate(String(id), {
      onSuccess: ()=>router.replace('/')
    })
  }

  if (!isNew && journalQuery.isLoading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Loading Journal</Text>
      </View>
    )
  }

  if (!isNew && !journalQuery.data) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>
          Journal not found
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <JournalHeader
        onBack={() => router.dismissTo('/')}
        createdAt = {isNew ? newCreatedAt : (journal?.createdAt as string)}
      />

      <JournalScreenContent
        draft={draft}
        isEditing={isEditing}
        isSaving={saveJournalMutation.isPending || updateJournalMutation.isPending}
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
  title: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 28,
    color: "#3D3125",
    textAlign: "center",
    marginTop: 120,
  },
});

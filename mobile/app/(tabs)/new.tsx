import { View, Text, StyleSheet } from "react-native";
import { router,} from "expo-router";
import { useEffect,useRef} from "react";
import useCreateJournalEntry from "@/hooks/use-create-journal-entry";
import RecordButton from "@/components/RecordButton/RecordButton";
import { RecordStatusTypes } from "@/types/types";
import { getTodayJournal, saveOrAppendJournal } from "@/services/journal-service";
import { Journal } from "@/types/journal";

export default function NewScreen() {
  const {
    recordStatus,
    transcript,
    startRecording,
    stopRecording,
    startTranscribe,
  } = useCreateJournalEntry();

  const getPressFunction = (recordStatus: RecordStatusTypes) => {
    if (recordStatus === 'idle') return startRecording;
    else if (recordStatus === 'recording') return stopRecording;
    else if (recordStatus === 'readyToTranscribe') return startTranscribe;
    
    return async ()=>{}
  }

  const hasSavedRef = useRef(false)

  // useEffect(() => {
  //   if (recordStatus === 'preview' && transcript) {
  //     saveOrAppendJournal(transcript)
  //       router.push({
  //         pathname: "/journal/[id]",
  //         params: {
  //           id: "new",
  //           transcript,
  //           mode: "edit",
  //         },
  //       });
  //   }
  // }, [recordStatus, transcript])

  useEffect(() => {
    const saveAndGoToJournal = async () => {
      if (recordStatus !== 'preview' || !transcript) return
      if (hasSavedRef.current) return;

      hasSavedRef.current = true;

      const journal = await saveOrAppendJournal(transcript)

      router.push({
        pathname: "/journal/[id]",
        params: {
          id: (journal as Journal).id
        }
      })
    }

    saveAndGoToJournal()
  }, [recordStatus, transcript])

 

  return (
    <View
      style={styles.screen}
    >
      <Text
        style={styles.title}
      >
        New Entry
      </Text>
      <RecordButton
        recordStatus={recordStatus}
        onPress = {getPressFunction(recordStatus)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F1DD",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "SpecialElite_400Regular",
    fontSize: 32,
    color: "#3D3125",
  },
  transcript: {
    marginTop: 24,
    color: "#3D3125",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  transcriptBtn: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: "#8A6F4D",
  },
});
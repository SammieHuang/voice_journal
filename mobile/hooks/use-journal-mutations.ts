import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveJournal, updateJournalTranscript, deleteJournal } from "@/services/journal-service";
import { journalKeys } from "@/queries/journal-keys";   

export const useSaveJournalMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transcript: string) => saveJournal(transcript),
        onSuccess: (savedJournal) => {
            if (!savedJournal) return;
            queryClient.setQueryData(journalKeys.detail(savedJournal.id), savedJournal)
            queryClient.invalidateQueries({queryKey: journalKeys.lists()})
        }
    })
}

export const useUpdateJournalMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, transcript }: { id: string; transcript: string }) => 
            updateJournalTranscript(id, transcript),
      
        onSuccess: (updatedJournal) => {
            queryClient.setQueryData(journalKeys.detail(updatedJournal.id), updatedJournal);
            queryClient.invalidateQueries({queryKey: journalKeys.lists()})
        }
    })
}

export const useDeleteJournalMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteJournal(id),
        onSuccess: (_data, id) => {
            queryClient.removeQueries({ queryKey: journalKeys.detail(id) })
            queryClient.invalidateQueries({queryKey: journalKeys.lists()})
        }
    })
}
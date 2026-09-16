import { useQuery } from "@tanstack/react-query";
import { getCloudJournals, getJournalById } from "@/services/journal-service";  
import { journalKeys } from "@/queries/journal-keys";

export const useJournalsQuery = () => {
    return useQuery({
        queryKey: journalKeys.lists(),
        queryFn: getCloudJournals,
    })
}

export const useJournalQuery = (id: string) => {
    return useQuery({
        queryKey: journalKeys.detail(id),
        queryFn: () => getJournalById(id),
        enabled: !!id && id !== 'new'
    })
}
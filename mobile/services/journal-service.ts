import AsyncStorage from "@react-native-async-storage/async-storage";
import { Journal } from "@/types/journal";

const JOURNAL_KEY = 'voice-journal-entries'

export const getJournals = async (): Promise<Journal[]> => {
    const existing = await AsyncStorage.getItem(JOURNAL_KEY)
    return existing ? JSON.parse(existing) : []
}

export const getJournalById = async (id: string): Promise<Journal | null> => {
    const journals = await getJournals()
    return journals.find(journal=>journal.id === id) ?? null
}

export const saveJournal = async (transcript: string): Promise<Journal> => {
    const newJournal: Journal = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        transcript,
    }

    const journals = await getJournals()
    const updatedJournals = [newJournal, ...journals];

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updatedJournals))

    return newJournal
}

export const deleteJournal = async (id: string): Promise<void> => {
    const journals = await getJournals();
    const updatedJournals = journals.filter((journal) => journal.id !== id);

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updatedJournals))
}
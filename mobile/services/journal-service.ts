import AsyncStorage from "@react-native-async-storage/async-storage";
import {supabase} from '@/services/supabase'
import { Journal, DbJournal} from "@/types/journal";

const JOURNAL_KEY = 'voice-journal-entries'

export const mapDbJournalToJournal = (row: DbJournal): Journal => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? undefined,
  transcript: row.transcript ?? undefined,
  audioUrl: row.audio_url ?? undefined,
  mood:
    row.mood_score !== null && row.mood_score !== undefined && row.mood_label
      ? { score: row.mood_score, label: row.mood_label }
      : undefined,
  tags: row.tags ?? [],
});

export const getLocalJournals = async (): Promise<Journal[]> => {
    const existing = await AsyncStorage.getItem(JOURNAL_KEY)
    return existing ? JSON.parse(existing) : []
}

export const cacheJournals = async (journals: Journal[]) => {
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(journals))
}

export const getCloudJournals = async (): Promise<Journal[]> => {
    const { data, error } = await supabase
        .from('journals')
        .select("*")
        .order('created_at', { ascending: false })
    
    if (error) throw error
    const journals = (data ?? []).map(mapDbJournalToJournal)

    await cacheJournals(journals)
      console.log("error:", error);
      console.log("data length:", data?.length);
      console.log("data:", data);

    return journals
}

export const getJournalById = async (id: string): Promise<Journal | null> => {
    const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('id', id)
        .maybeSingle()
    
    if (error) throw error
    if(!data) return null

    return mapDbJournalToJournal(data)
};

export const saveJournal = async (transcript: string): Promise<Journal> => {
  const newJournal: DbJournal= {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    transcript,
    tags: []
  };
    
    const { data, error } = await supabase
        .from('journals')
        .insert([newJournal])
        .select()
        .single()
    
    if (error) throw error
    
    const savedJournal = mapDbJournalToJournal(data)

    const localJournals = await getLocalJournals()
    await cacheJournals([savedJournal, ...localJournals])

    return savedJournal
};

export const updateJournalTranscript = async (id: string, transcript: string): Promise<Journal> => {
    const { data, error } = await supabase
        .from('journals')
        .update({
            transcript,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
    
    if (error) throw error
    
    const updatedJournal = mapDbJournalToJournal(data)

    const localJournals = await getLocalJournals()

    const updatedLocalJournals = localJournals.map(journal => journal.id === id ? updatedJournal: journal)
    
    await cacheJournals(updatedLocalJournals)

    return updatedJournal
}


export const deleteJournal = async (id: string): Promise<void> => {

    const { error } = await supabase.from('journals').delete().eq('id', id)
    
    if (error) throw error
    
    const localJournals = await getLocalJournals()

    await cacheJournals(localJournals.filter(journal=>journal.id !== id))
}

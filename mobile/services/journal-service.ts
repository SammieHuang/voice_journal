import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '@/services/supabase'
import { Journal, DbJournal, MoodLabel} from "@/types/journal";

const JOURNAL_KEY = 'voice-journal-entries'

export const mapDbJournalToJournal = (row: DbJournal): Journal => ({
  id: row.id,

  userId: row.user_id ?? undefined,

  createdAt: row.created_at,
  updatedAt: row.updated_at ?? undefined,

  transcript: row.transcript ?? undefined,

  audioUrl: row.audio_url ?? undefined,

  mood:
    row.mood_score !== null || row.mood_label !== null
      ? {
          score: row.mood_score ?? undefined,
          label: (row.mood_label as MoodLabel | null) ?? undefined,
        }
      : undefined,

  tags: row.tags ?? undefined,
});

export const mapJournalToDbJournal = (
  journal: Journal,
): Partial<DbJournal> => ({
  id: journal.id,

  user_id: journal.userId ?? null,

  created_at: journal.createdAt,
  updated_at: journal.updatedAt ?? null,

  transcript: journal.transcript ?? null,

  audio_url: journal.audioUrl?? null,

  mood_score: journal.mood?.score ?? null,
  mood_label: journal.mood?.label ?? null,

  tags: journal.tags ?? null,
});

export const getLocalJournals = async (): Promise<Journal[]> => {
    const existing = await AsyncStorage.getItem(JOURNAL_KEY)
    return existing ? JSON.parse(existing) : []
}

export const cacheJournals = async (journals: Journal[]) => {
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(journals))
}

export const getCloudJournals = async (): Promise<Journal[]> => {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
          console.log("No current user for journals", userError.message);
          return [];
    }
    
    if (!user) return []
    
    const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    
    if (error) throw error
    const journals = (data ?? []).map(mapDbJournalToJournal)

    await cacheJournals(journals)

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

export const saveJournal = async (transcript: string): Promise<Journal | null> => {
    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) throw sessionError;

    const user = session?.user

    if (!user) {
        console.log('no user user')
        return null
    }

    const newJournal: Partial<DbJournal> = {
        id: Date.now().toString(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: null,
        transcript,
        audio_url: null,
        mood_score: null,
        mood_label: null,
        tags: []
    }

    const { data, error } = await supabase
      .from("journals")
      .insert([newJournal])
      .select()
      .single();
    
    if (error) throw error

    const savedJournal = mapDbJournalToJournal(data);
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

export const getTodayJournal = async (): Promise<Journal | null> => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const tmrStart = new Date(todayStart)
    tmrStart.setDate(todayStart.getDate() + 1)

    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .gte("created_at", todayStart.toISOString())
      .lt("created_at", tmrStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
        .maybeSingle()
    
    if (error) throw error
    return data ? mapDbJournalToJournal(data) : null
}

export const saveOrAppendJournal = async (transcript: string) => {
        const todayJournal = await getTodayJournal()
        if (!todayJournal) return saveJournal(transcript)
        
        const id = todayJournal.id
        const journalScript = (todayJournal.transcript ?? "") + "\n\n" + transcript;

        return await updateJournalTranscript(id, journalScript as string)

}

export const clearLocalJournals = async () => {
    await AsyncStorage.removeItem(JOURNAL_KEY)
}
export type Journal = {
  id: string;
  createdAt: string;
  userId?: string;
  updatedAt?: string;
  
  transcript?: string;

  audioUri?: string;
  audioUrl?: string;

  mood?: {
    score?: number; // 1-10
    label?: MoodLabel;
  };

  tags?: string[];
};

export type DbJournal = {
  id: string;

  user_id: string | null;

  created_at: string;
  updated_at: string | null;

  transcript: string | null;

  audio_url: string | null;

  mood_score: number | null;
  mood_label: string | null;

  tags: string[] | null;
};

export type MoodLabel =
  | "happy"
  | "calm"
  | "sad"
  | "anxious"
  | "angry"
  | "tired"
  | "neutral";


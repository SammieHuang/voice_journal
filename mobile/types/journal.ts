export type Journal = {
  id: string;

  createdAt: string;
  updatedAt?: string;
  
  transcript?: string;

  audioUri?: string;
  audioUrl?: string;

  mood?: {
    score: number; // 1-10
    label: MoodLabel;
  };

  tags?: string[];
};

export type DbJournal = {
  id: string;
  created_at: string;
  updated_at?: string;
  transcript?: string;
  audio_url?: string;
  mood_score?: number;
  mood_label?: MoodLabel
  tags?: string[]
}

export type MoodLabel =
  | "happy"
  | "calm"
  | "sad"
  | "anxious"
  | "angry"
  | "tired"
  | "neutral";


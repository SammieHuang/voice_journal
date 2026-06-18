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

export type MoodLabel =
  | "happy"
  | "calm"
  | "sad"
  | "anxious"
  | "angry"
  | "tired"
  | "neutral";


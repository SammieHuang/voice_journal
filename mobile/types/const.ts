import type { Journal, MoodLabel } from "./journal";


export const journal: Journal = {
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  transcript: "今天我终于把 Voice Journal 做出来了，特别开心。",
  audioUri: "file://...",
  mood: {
    score: 9,
    label: "happy",
  },
  tags: ["coding", "project", "confidence"],
};
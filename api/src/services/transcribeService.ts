import fs from "fs";
import openai from "../lib/openai";

// Sends the audio file to OpenAI. Deleting the file is the caller's job. 
const transcribeAudio = async (path: string) => {
  const audio = fs.createReadStream(path)
  try {
    const transcription = await 
      openai.audio.transcriptions.create({
        file: audio,
        model:'gpt-4o-mini-transcribe'
      })
    
    return transcription.text;
  } finally {
    // Don't leave the file handle open if OpenAI failed before reading it all.
    audio.destroy();
  }
}

export { transcribeAudio}
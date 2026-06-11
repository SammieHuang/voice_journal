/** @format */

import fs from "fs";
import openai from "../lib/openai";

const transcribeAudio = async (path: string) => {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(path),
    model: "gpt-4o-mini-transcribe",
  });
    console.log("transcription: ", transcription)

  return transcription.text;
};

export { transcribeAudio };

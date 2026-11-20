import dotenv from "dotenv";
import { createApp } from "./app";
import { getProDailyTranscriptionLimit } from "./lib/config";

dotenv.config();

const app = createApp()
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Judi's radio station broadcasting 24/7 at http://localhost:${PORT}`);
  console.log( `Pro cloud transcription limit: ${getProDailyTranscriptionLimit()} per UTC day`)
});

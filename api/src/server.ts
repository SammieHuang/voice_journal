/** @format */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import transcribeRouter from "./routes/transcribe";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Voice Journal API is running",
  });
});

app.use('/transcribe', transcribeRouter)

app.listen(PORT, () => {
  console.log(`Judi's radio station broadcasting 24/7 at http://localhost:${PORT}`);
});

import openAI from "openai";

require("dotenv").config();

const openai = new openAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

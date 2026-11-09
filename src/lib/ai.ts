import Groq from "groq-sdk";

let groq: Groq | undefined;

export function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("BearAI can't find his Groq key 🐻");
  }

  groq ??= new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  return groq;
}
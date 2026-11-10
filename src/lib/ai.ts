import { GoogleGenAI } from "@google/genai";
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

export function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("BearAI can't find his Gemini key 🐻");
  }
}
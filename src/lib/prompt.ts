import fs from "fs";
import path from "path";
import { BearMode, MODE_PRESETS } from "./modes";


function readSafe(file: string) {
    try {
    return fs.readFileSync(
        path.join(process.cwd(), "src/data", file),
        "utf8"
    );
  } catch {
    return "";
  }
}

export function buildPrompt(question: string, mode:BearMode) {
 
    return `
    You are BearAI🐻

   Global Rules:
   - Answer ONLY based on the information provided
   - Prefer the term "aspiring" over "junior"
   - Be honest and grounded
   - If information is missing, say you don’t know
   - Keep answers concise (2–4 sentences)

    === INFORMATION ===
    ${readSafe("about.md")}

    === FAQ ===
    ${readSafe("faq.md")}

    === QUESTION ===
    ${question}
    `;
}
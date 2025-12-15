import fs from "fs";
import path from "path";


function read(file: string) {
    return fs.readFileSync(
        path.join(process.cwd(), "src/data", file),
        "utf8"
    );
}


export function buildPrompt(question: string) {
    const about = read("about.md");
    const faq = read("faq.md");


    return `
    You are BearAI🐻

    Rules:
    - Answer ONLY based on the information provided below
    - Be honest and concise
    - If the answer is unknown, say so
    - Light, friendly, funny tone is allowed
    - Do NOT exaggerate skills
    
    === INFORMATION ===
    ${about}

    === FAQ ===
    ${faq}

    === QUESTION ===
    ${question}
    `;
}
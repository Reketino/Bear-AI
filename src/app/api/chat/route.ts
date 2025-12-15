import { buildPrompt } from "@/lib/prompt";
import { openai } from "@/lib/ai";
import { BearMode } from "@/lib/modes";

export async function POST(req: Request) {
  const body = await req.json();

  const question: string = body.question;
  const mode: BearMode = body.mode ?? "professional";

  if (!question) {
    return Response.json(
      { answer: "No question for BearAI provided." },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(question, mode);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are BearAI." },
      { role: "user", content: prompt },
    ],
    temperature: mode === "fun" ? 0.5 : 0.3,
  });

  const answer =
    completion.choices[0]?.message?.content ??
    "Sorry, I don't have enough information to answer that.";

  return Response.json({ answer });
}

import { buildPrompt } from "@/lib/prompt";
import { openai } from "@/lib/ai";



export async function POST(req: Request) {
    const { question } = await req.json();


   if (!question) {
    return Response.json(
        { answer: "No question for BearAI provided." },
        { status: 400 }
    );
   } 
    

   const prompt = buildPrompt(question);

   const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
       {
        role: "system",
        content: "You are BearAI, a personal portfolio assistant",
       },
       {
        role: "user",
        content: prompt,
       },
    ],
    temperature: 0.3,
   });

   const answer =
   completion.choices[0]?.message?.content ??
   "Sorry, I don't have enough information to answer that.";

   return Response.json({ answer });
}

//Cors headers for allowing frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type RateEntry = {
  count: number;
  lastReset: number;
};

// IN-MEMORY GLOBAL RATE LIMIT STORE
declare global {
  var _bearRateLimit: Map<string, RateEntry> | undefined;
}

// SIMPLE RATE LIMITER FOR IN-MEMORY CONFIG
const RATE_LIMIT_WINDOW = 10_000;
const MAX_REQUESTS = 5;

globalThis._bearRateLimit ??= new Map<string, RateEntry>();
const rateLimit = globalThis._bearRateLimit as Map<string, RateEntry>;

import { buildPrompt } from "@/lib/prompt";
import { openai } from "@/lib/ai";
import { BearMode } from "@/lib/modes";

// CORS PREFLIGHT HANDLER
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
// MAIN API HANDLING
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, lastReset: now });
  } else {
    if (entry.count >= MAX_REQUESTS) {
      return new Response(
        JSON.stringify({
          answer: "🐻 BearAI is out of breath, give him a sec to recover",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    entry.count++;
  }

  const body = await req.json();
  const question: string = body.question;
  const mode: BearMode = body.mode ?? "professional";

  if (!question) {
    return new Response(
      JSON.stringify({
        answer: "No question for BearAI provided.",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
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

  return new Response(JSON.stringify({ answer }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

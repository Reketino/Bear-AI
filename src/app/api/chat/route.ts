
import { buildPrompt } from "@/lib/prompt";
import { getGroqClient } from "@/lib/ai";
import type { BearMode } from "@/lib/modes";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type RateEntry = {
  count: number;
  lastReset: number;
};

type ChatRequest = {
  question?: unknown;
  mode?: unknown;
};

declare global {
  var _bearRateLimit: Map<string, RateEntry> | undefined;
}

const RATE_LIMIT_WINDOW = 10_000;
const MAX_REQUESTS = 5;
const MAX_QUESTION_LENGTH = 2_000;

const VALID_MODES: BearMode[] = [
  "professional",
  "casual",
  "fun",
  "story",
];

globalThis._bearRateLimit ??= new Map<string, RateEntry>();

const rateLimit = globalThis._bearRateLimit;

class AllProvidersFailedError extends Error {
  constructor(provider: string) {
    super(`${provider} returned an empty response.`);
    this.name = "EmptyProviderResponseError";
  }
}

function jsonResponse(
  data: { answer: string },
  status: number
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}


export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const now = Date.now();
    const entry = rateLimit.get(ip);

    if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
      rateLimit.set(ip, {
        count: 1,
        lastReset: now,
      });
    } else {
      if (entry.count >= MAX_REQUESTS) {
        return jsonResponse(
          {
            answer: "🐻 BearAI is out of breath. Give him a moment!",
          },
          429
        );
      }

      entry.count++;
    }

    const body = (await req.json()) as ChatRequest;

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    const mode = VALID_MODES.includes(body.mode as BearMode)
      ? (body.mode as BearMode)
      : "professional";


    if (!question) {
      return jsonResponse(
        {
          answer: "No question for BearAI provided.",
        },
        400
      );
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return jsonResponse(
        {
          answer: "That's a little too much for BearAI! Keep it shorter.",
        },
        400
      );
    }
    
    const prompt = buildPrompt(question, mode);

    const completion =  await getGroqClient().chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: "You are BearAI.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      reasoning_effort: "low",
      max_completion_tokens: 500,
    });

    const answer =
      completion.choices[0]?.message?.content ??
      "Sorry, I don't have enough information to answer that.";

    return jsonResponse({ answer }, 200);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 429
    ) {
      return jsonResponse(
        {
          answer: "🐻 BearAI needs a short break. Try again soon!",
        },
        429
      );
    }

    console.error("BearAI API error:", error);

    return jsonResponse(
      {
        answer: "Something went wrong. BearAI will be back shortly!",
      },
      500
    );
  }
}

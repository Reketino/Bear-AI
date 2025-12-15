import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
    throw new Error("BearAI can't find his keys💩");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
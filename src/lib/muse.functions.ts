import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function callAI(messages: any[]) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit reached.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`AI gateway error: ${res.status}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

export const dailyMuse = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ seed: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const text = await callAI([
      { role: "system", content: "You are The Siren — a moody, evocative writing muse. For the given date-seed, return EXACTLY this JSON (no fences): {\"prompt\":\"…\",\"image\":\"…\",\"whisper\":\"…\"}. 'prompt' is a single intriguing writing prompt (≤ 35 words). 'image' is a one-line sensory image (≤ 20 words). 'whisper' is a 6-10 word poetic encouragement." },
      { role: "user", content: `Seed: ${data.seed}` },
    ]);
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { prompt: text.slice(0, 240), image: "", whisper: "Write the first true sentence." };
    }
  });

export const webResearch = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ question: z.string().min(2).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const answer = await callAI([
      { role: "system", content: "You are an academic research assistant. Answer the user's question with structured, scholarly prose. Use clear sections (Overview, Key Points, Considerations). Note: you do not have live web access — flag any claim that may be out of date or require verification by writing [verify] beside it. Never fabricate citations." },
      { role: "user", content: data.question },
    ]);
    return { answer };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const askObsidian = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ question: z.string().min(2).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are Obsidian, a warm and concise help assistant for Obsidian Siren Studio — a writing platform with two modes: Weaver (fiction) and Scholar (academic). Answer support and creative-writing questions in 1-3 short paragraphs." },
          { role: "user", content: data.question },
        ],
      }),
    });
    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Top up your workspace.");
      throw new Error("AI gateway error");
    }
    const json = await res.json();
    return { answer: json.choices?.[0]?.message?.content ?? "(no answer)" };
  });

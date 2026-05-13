import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  genre: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  environment: z.string().min(1).max(500),
  extra: z.string().max(1000).optional().default(""),
});

export const generateCoverPrompt = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Lovable AI is not configured.");

    const system =
      "You are an art director crafting professional book cover prompts. " +
      "Given an interview, produce ONE single richly detailed image-generation prompt " +
      "(2-4 sentences) suitable for a cover artist or image model. Focus on composition, " +
      "lighting, color palette, mood, materials, typography placement (leave space for title). " +
      "Do not include any preamble, just the prompt.";

    const user = `Genre & mood: ${data.genre}\nMain subject: ${data.subject}\nEnvironmental details: ${data.environment}\nExtra notes: ${data.extra || "(none)"}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (r.status === 429) throw new Error("Rate limited — try again shortly.");
    if (r.status === 402) throw new Error("AI credits exhausted. Add funds in Lovable Cloud.");
    if (!r.ok) throw new Error(`AI gateway error (${r.status})`);

    const json = await r.json();
    const prompt: string = json?.choices?.[0]?.message?.content ?? "";
    return { prompt: prompt.trim() };
  });

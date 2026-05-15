import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const summarizePlot = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      points: z.array(z.object({
        label: z.string().min(1).max(200),
        content: z.string().min(1).max(4000),
      })).min(1).max(50),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
    const corpus = data.points.map((p) => `## ${p.label}\n${p.content}`).join("\n\n");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a story editor. Take the writer's plot points and produce a single cohesive narrative synopsis (3-5 paragraphs). Preserve their intent. Smooth gaps, suggest connective tissue where natural, and write in a warm but professional tone. Do not invent major new characters or twists." },
          { role: "user", content: corpus },
        ],
      }),
    });
    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`AI gateway error: ${res.status}`);
    }
    const json = await res.json();
    return { synopsis: (json.choices?.[0]?.message?.content ?? "").trim() };
  });

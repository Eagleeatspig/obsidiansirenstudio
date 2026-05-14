import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const researchAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ question: z.string().min(2).max(4000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: sources, error } = await supabase
      .from("research_sources")
      .select("title, extracted_text")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);

    if (!sources || sources.length === 0) {
      return { answer: "Your Source Vault is empty. Upload research PDFs first, then ask again." };
    }

    const corpus = sources
      .map((s, i) => `### Source [${i + 1}] — ${s.title}\n${(s.extracted_text ?? "").slice(0, 12000)}`)
      .join("\n\n")
      .slice(0, 80000);

    const answer = await callAI([
      { role: "system", content: `You are a Research Assistant. Answer ONLY using the source papers below. If the answer is not present, say "Not found in your source vault." Cite sources inline as [Source N — Title]. Be precise about line/page accuracy: only quote when the text appears verbatim in a source.\n\n${corpus}` },
      { role: "user", content: data.question },
    ]);
    return { answer };
  });

export const formatCitation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    style: z.enum(["MLA", "APA", "Chicago"]),
    raw: z.string().min(5).max(2000),
  }).parse(d))
  .handler(async ({ data }) => {
    const styleHelp = {
      MLA: "MLA 9th — Author-Page in-text, Works Cited entry. Hanging indent.",
      APA: "APA 7th — Author-Date in-text, References entry. Italicize titles of works.",
      Chicago: "Chicago 17th — Notes-Bibliography. Provide both a footnote and a bibliography entry.",
    }[data.style];
    const answer = await callAI([
      { role: "system", content: `You are a Smart Citation Engine. Convert raw source metadata into a perfectly formatted ${data.style} citation. Style rules: ${styleHelp}. Output only the formatted citation(s) — no commentary.` },
      { role: "user", content: data.raw },
    ]);
    return { citation: answer };
  });

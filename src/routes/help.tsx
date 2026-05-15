import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { askObsidian } from "@/lib/help.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Ask Obsidian — Help & FAQ" }] }),
  component: HelpPage,
});

const FAQ = [
  ["How do I switch between Weaver and Scholar modes?", "Use the toggle in the sidebar. Your choice persists across sessions."],
  ["Are my research PDFs private?", "Yes. Files live in a private bucket and only you can access them."],
  ["Which AI model powers the Research Assistant?", "Lovable AI's Gemini 2.5 Flash. It only sees the source papers you upload to your vault."],
  ["Can I export my manuscript?", "Use Book Formatting to render and download a print-ready PDF."],
  ["What citation styles do you support?", "MLA (Author–Page), APA (Author–Date), and Chicago (Notes/Bib)."],
  ["I need a real human editor.", "Visit Expert Services. We have proofreaders, developmental editors, and publishing consultants."],
  ["How do I delete my account?", "Go to Settings → Sign out, then email support to permanently delete your data."],
  ["Is there a mobile app?", "Not yet. The web studio is fully responsive in the meantime."],
];

function HelpPage() {
  const ask = useServerFn(askObsidian);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [busy, setBusy] = useState(false);

  const onAsk = async () => {
    if (!q.trim()) return;
    setBusy(true); setA("");
    try {
      const res = await ask({ data: { question: q } });
      setA(res.answer);
    } catch (e: any) { toast.error(e.message ?? "Failed to ask"); }
    finally { setBusy(false); }
  };

  return (
    <StudioLayout title="Ask Obsidian" publicPage>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <PageHeader topLabel="Help & Support" bigTitle="Ask Obsidian" sub="Frequently whispered questions, and a Siren who'll answer the rest." />

        <div className="mb-10 rounded-2xl border border-primary/30 bg-card/60 p-6 backdrop-blur-xl">
          <Label className="text-xs uppercase tracking-[0.3em] text-silver/80">Ask anything</Label>
          <Textarea value={q} onChange={(e) => setQ(e.target.value)} rows={3} placeholder="How do I export my book to PDF?" className="mt-2" />
          <Button onClick={onAsk} disabled={busy} className="mt-3 bg-gradient-to-r from-primary to-primary-glow">
            {busy ? "Consulting the Siren…" : "Ask"}
          </Button>
          {a && (
            <div className="mt-4 rounded-lg border border-silver/30 bg-background/40 p-4 text-sm text-silver whitespace-pre-wrap">
              {a}
            </div>
          )}
        </div>

        <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-silver/80">FAQ</h2>
        <Accordion type="single" collapsible className="rounded-2xl border border-border/60 bg-card/40">
          {FAQ.map(([q, a], i) => (
            <AccordionItem key={i} value={`i${i}`} className="px-4">
              <AccordionTrigger className="text-left font-serif text-base text-foreground">{q}</AccordionTrigger>
              <AccordionContent className="text-sm text-silver">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </StudioLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

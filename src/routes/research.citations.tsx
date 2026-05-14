import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { formatCitation } from "@/lib/research.functions";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/research/citations")({
  head: () => ({ meta: [{ title: "Citation Engine — Scholar's Sanctum" }] }),
  component: CitationsPage,
});

const STYLES = ["MLA", "APA", "Chicago"] as const;

function CitationsPage() {
  const fmt = useServerFn(formatCitation);
  const [raw, setRaw] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const onFormat = async (style: typeof STYLES[number]) => {
    if (!raw.trim()) return toast.error("Paste source metadata first.");
    setBusy(style);
    try {
      const res = await fmt({ data: { style, raw } });
      setResults((r) => ({ ...r, [style]: res.citation }));
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };

  return (
    <StudioLayout title="Citations">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <PageHeader topLabel="Smart Citation Engine" bigTitle="The Citation Forge" sub="Paste source metadata. Receive perfectly-styled citations." />

        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={6}
          placeholder={'e.g. "Smith, John. The Theory of Everything. Penguin, 2021. p.42."'}
          className="bg-card/60"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          {STYLES.map((s) => (
            <Button key={s} onClick={() => onFormat(s)} disabled={!!busy}
              className="bg-gradient-to-r from-primary to-primary-glow">
              {busy === s ? "…" : `Format as ${s}`}
            </Button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {STYLES.map((s) => results[s] && (
            <div key={s} className="rounded-2xl border border-silver/30 bg-card/60 p-5 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">{s}</p>
                <Button variant="ghost" size="sm" onClick={() => copy(results[s])}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="whitespace-pre-wrap font-serif text-sm text-silver">{results[s]}</p>
            </div>
          ))}
        </div>
      </div>
    </StudioLayout>
  );
}

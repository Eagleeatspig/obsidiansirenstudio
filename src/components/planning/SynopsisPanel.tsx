import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizePlot } from "@/lib/plot.functions";
import { loadPersisted, usePersisted } from "@/lib/persist";
import { toast } from "sonner";

type Section = { id: string; label: string; value: string };

export function SynopsisPanel() {
  const summarize = useServerFn(summarizePlot);
  const [synopsis, setSynopsis] = usePersisted<string>("synopsis.text", "");
  const [busy, setBusy] = useState(false);

  const onAnalyze = async () => {
    const plot = loadPersisted<Section[]>("plot.sections", []);
    const conflict = loadPersisted<Record<string, string>>("conflict.values", {});

    const points: { label: string; content: string }[] = [];
    plot.filter((s) => s.value?.trim()).forEach((s) => points.push({ label: `[Plot] ${s.label}`, content: s.value }));
    Object.entries(conflict).filter(([, v]) => v?.trim()).forEach(([k, v]) => points.push({ label: `[Conflict] ${k}`, content: v }));

    if (points.length === 0) {
      toast.error("Add plot points or conflict notes first.");
      return;
    }

    setBusy(true);
    try {
      const res = await summarize({ data: { points } });
      setSynopsis(res.synopsis);
    } catch (e: any) {
      toast.error(e?.message || "Failed to analyze.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-foreground">Narrative Synopsis</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The Siren reads everything in <span className="text-silver">Plot Points</span> and{" "}
              <span className="text-silver">Conflict & Arcs</span> and weaves it into a single cohesive narrative.
            </p>
          </div>
          <Button onClick={onAnalyze} disabled={busy} className="bg-gradient-to-r from-primary to-primary-glow">
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Analyzing…" : synopsis ? "Re-analyze" : "Analyze & Summarize"}
          </Button>
        </div>
      </div>

      {synopsis ? (
        <div className="rounded-2xl border border-primary/40 bg-card/60 p-8 backdrop-blur">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary">AI Narrative Synopsis</p>
          <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-silver">{synopsis}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-10 text-center text-sm text-muted-foreground">
          Fill in your Plot Points and Conflict & Arcs, then summon the Siren above.
        </div>
      )}
    </div>
  );
}

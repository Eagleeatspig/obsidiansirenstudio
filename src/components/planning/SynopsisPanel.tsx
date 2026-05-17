import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizePlot } from "@/lib/plot.functions";
import { loadPersisted, usePersisted } from "@/lib/persist";
import { toast } from "sonner";

type Section = { id: string; label: string; value: string };
type Category = { name: string; fields: string[] };
type Placed = { id: string; icon: string; x: number; y: number };

export function SynopsisPanel() {
  const summarize = useServerFn(summarizePlot);
  const [synopsis, setSynopsis] = usePersisted<string>("synopsis.text", "");
  const [busy, setBusy] = useState(false);

  const onAnalyze = async () => {
    const points: { label: string; content: string }[] = [];

    // Characters
    const charCats = loadPersisted<Category[]>("characters.categories", []);
    const chars = loadPersisted<Record<string, Record<string, string>>[]>("characters.list", []);
    chars.forEach((c, i) => {
      const name = (c as any)["Core Identity"]?.Name?.trim() || `Character ${i + 1}`;
      const lines: string[] = [];
      charCats.forEach(({ name: section, fields }) => {
        fields.forEach((f) => {
          const v = ((c as any)?.[section]?.[f] as string)?.trim();
          if (v) lines.push(`${section} — ${f}: ${v}`);
        });
      });
      if (lines.length) points.push({ label: `[Character] ${name}`, content: lines.join("\n") });
    });

    // World building
    const worldCats = loadPersisted<string[]>("world.categories", []);
    const worldVals = loadPersisted<Record<string, string>>("world.values", {});
    worldCats.forEach((cat) => {
      const v = worldVals[cat]?.trim();
      if (v) points.push({ label: `[World] ${cat}`, content: v });
    });

    // Fantasy map
    const map = loadPersisted<Placed[]>("map.items", []);
    if (map.length) {
      const counts = map.reduce<Record<string, number>>((acc, it) => {
        acc[it.icon] = (acc[it.icon] || 0) + 1;
        return acc;
      }, {});
      const summary = Object.entries(counts).map(([icon, n]) => `${icon} ×${n}`).join(", ");
      points.push({ label: `[Map] Landmarks`, content: summary });
    }

    // Plot points
    const plot = loadPersisted<Section[]>("plot.sections", []);
    plot.filter((s) => s.value?.trim()).forEach((s) =>
      points.push({ label: `[Plot] ${s.label}`, content: s.value }),
    );

    // Conflict & arcs
    const conflict = loadPersisted<Record<string, string>>("conflict.values", {});
    Object.entries(conflict).filter(([, v]) => v?.trim()).forEach(([k, v]) =>
      points.push({ label: `[Conflict] ${k}`, content: v }),
    );

    if (points.length === 0) {
      toast.error("Fill in any planning tab first.");
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
              The Siren reads everything from <span className="text-silver">Characters</span>,{" "}
              <span className="text-silver">World Building</span>, <span className="text-silver">Fantasy Map</span>,{" "}
              <span className="text-silver">Plot Points</span> and <span className="text-silver">Conflict & Arcs</span>,
              then weaves it into a single cohesive narrative.
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
          Fill in any planning tab, then summon the Siren above.
        </div>
      )}
    </div>
  );
}

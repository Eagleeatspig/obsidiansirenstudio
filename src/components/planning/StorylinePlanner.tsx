import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { usePersisted } from "@/lib/persist";

type Section = { id: string; label: string; value: string; locked?: boolean };

const DEFAULT_SECTIONS: Section[] = [
  { id: "hook", label: "The Hook", value: "", locked: true },
  { id: "inciting", label: "Inciting Incident", value: "", locked: true },
  { id: "pp1", label: "Plot Point 1", value: "", locked: true },
  { id: "midpoint", label: "The Midpoint (Shift from Reaction to Action)", value: "", locked: true },
  { id: "pinch", label: "Pinch Points", value: "", locked: true },
  { id: "pp2", label: "Plot Point 2 (The Dark Night)", value: "", locked: true },
  { id: "climax", label: "Climax", value: "", locked: true },
  { id: "resolution", label: "Resolution", value: "", locked: true },
];

export function StorylinePlanner() {
  const [sections, setSections] = usePersisted<Section[]>("plot.sections", DEFAULT_SECTIONS);

  const update = (id: string, value: string) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, value } : x)));
  const updateLabel = (id: string, label: string) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, label } : x)));
  const remove = (id: string) => setSections((s) => s.filter((x) => x.id !== id));
  const addCustom = () =>
    setSections((s) => [...s, { id: `custom-${Date.now()}`, label: "New Plot Point", value: "" }]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
        <div className="mb-4">
          <h3 className="font-serif text-xl text-foreground">Plot Points Engine</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in each beat. Add custom points anywhere. Your work auto-saves as you type.
            When you're ready, head to the <span className="text-silver">Synopsis</span> tab to weave it together.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/50 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                {s.locked ? (
                  <span className="text-xs uppercase tracking-[0.2em] text-primary">{s.label}</span>
                ) : (
                  <Input
                    value={s.label}
                    onChange={(e) => updateLabel(s.id, e.target.value)}
                    className="h-7 max-w-xs text-xs uppercase tracking-[0.2em]"
                  />
                )}
                {!s.locked && (
                  <Button variant="ghost" size="sm" onClick={() => remove(s.id)} className="ml-auto">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Textarea
                value={s.value}
                onChange={(e) => update(s.id, e.target.value)}
                rows={3}
                placeholder="What happens here?"
              />
            </div>
          ))}
        </div>

        <Button onClick={addCustom} variant="outline" className="mt-4 border-silver">
          <Plus className="h-4 w-4" /> Add Plot Point
        </Button>
      </div>
    </div>
  );
}

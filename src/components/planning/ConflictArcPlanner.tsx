import { Textarea } from "@/components/ui/textarea";
import { usePersisted } from "@/lib/persist";

const SECTIONS = [
  ["Main Problem", "What is the central problem driving the story?"],
  ["The Stakes", "What is at risk if the protagonist fails?"],
  ["Who Is Affected", "Whose lives change because of this conflict?"],
  ["External Conflict", "The tangible, outer struggle."],
  ["Internal Conflict", "The emotional, inner struggle."],
  ["Character Starting Points", "Where the characters begin emotionally / situationally."],
  ["Turning Points", "Key moments that pivot each character's arc."],
  ["Character Ending Points", "Where each character lands by the close."],
];

export function ConflictArcPlanner() {
  const [vals, setVals] = usePersisted<Record<string, string>>("conflict.values", {});
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {SECTIONS.map(([title, hint]) => (
        <div key={title} className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
          <h3 className="font-serif text-lg text-foreground">{title}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{hint}</p>
          <Textarea
            rows={5}
            value={vals[title] || ""}
            onChange={(e) => setVals((v) => ({ ...v, [title]: e.target.value }))}
          />
        </div>
      ))}
    </div>
  );
}

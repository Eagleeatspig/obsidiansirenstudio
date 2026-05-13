import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const FIELDS = {
  "Core Identity": ["Name", "Age", "Gender", "Species", "Role"],
  "Personality & Psychology": [
    "Traits", "Likes & Dislikes", "Fears", "Desires",
    "Motivations", "Fatal Flaws", "Weaknesses", "Internal Conflict",
  ],
  "Physical Description": ["Appearance", "Clothing Style", "Distinguishing Features"],
  "Backstory": ["Childhood Events", "Key Life Events", "Family Background or Trauma"],
  "Behaviour": ["Speech Style", "Mannerisms", "Quirks"],
  "What Makes Them Tick / Break": ["What makes them tick", "What breaks them", "What they want and need (motivation)"],
} as const;

export function CharacterPlanner() {
  const [characters, setCharacters] = useState<Record<string, Record<string, string>>[]>([{}]);
  const [active, setActive] = useState(0);

  const update = (section: string, field: string, val: string) => {
    setCharacters((cs) => {
      const next = [...cs];
      const c = { ...(next[active] || {}) };
      const sect = { ...((c as any)[section] || {}) };
      sect[field] = val;
      (c as any)[section] = sect;
      next[active] = c;
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-2">
        {characters.map((c, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
              i === active ? "border-primary/60 bg-primary/10 text-foreground" : "border-border/50 bg-card/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {(c as any)["Core Identity"]?.Name || `Character ${i + 1}`}
          </button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="w-full border-silver"
          onClick={() => {
            setCharacters((cs) => [...cs, {}]);
            setActive(characters.length);
          }}
        >
          <Plus className="h-4 w-4" /> Add Character
        </Button>
      </aside>

      <div className="space-y-8">
        {Object.entries(FIELDS).map(([section, fields]) => (
          <div key={section} className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <h3 className="mb-4 font-serif text-xl text-foreground">{section}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => {
                const val = ((characters[active] as any)?.[section]?.[f] as string) || "";
                const isLong = f.length > 15;
                return (
                  <div key={f} className={isLong ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{f}</label>
                    {isLong ? (
                      <Textarea value={val} onChange={(e) => update(section, f, e.target.value)} rows={2} />
                    ) : (
                      <Input value={val} onChange={(e) => update(section, f, e.target.value)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

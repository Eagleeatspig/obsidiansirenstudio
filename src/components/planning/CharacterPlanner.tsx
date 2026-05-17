import { useState } from "react";
import { usePersisted } from "@/lib/persist";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

type Category = { name: string; fields: string[] };

const DEFAULT_CATEGORIES: Category[] = [
  { name: "Core Identity", fields: ["Name", "Age", "Gender", "Species", "Role"] },
  {
    name: "Personality & Psychology",
    fields: ["Traits", "Likes & Dislikes", "Fears", "Desires", "Motivations", "Fatal Flaws", "Weaknesses", "Internal Conflict"],
  },
  { name: "Physical Description", fields: ["Appearance", "Clothing Style", "Distinguishing Features"] },
  { name: "Backstory", fields: ["Childhood Events", "Key Life Events", "Family Background or Trauma"] },
  { name: "Behaviour", fields: ["Speech Style", "Mannerisms", "Quirks"] },
  { name: "What Makes Them Tick / Break", fields: ["What makes them tick", "What breaks them", "What they want and need (motivation)"] },
];

export function CharacterPlanner() {
  const [categories, setCategories] = usePersisted<Category[]>("characters.categories", DEFAULT_CATEGORIES);
  const [characters, setCharacters] = usePersisted<Record<string, Record<string, string>>[]>("characters.list", [{}]);
  const [active, setActive] = useState(0);
  const [newCatName, setNewCatName] = useState("");
  const [newFieldByCat, setNewFieldByCat] = useState<Record<string, string>>({});

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

  const addCategory = () => {
    const name = newCatName.trim();
    if (!name || categories.some((c) => c.name === name)) return;
    setCategories((cs) => [...cs, { name, fields: [] }]);
    setNewCatName("");
  };

  const addField = (cat: string) => {
    const f = (newFieldByCat[cat] || "").trim();
    if (!f) return;
    setCategories((cs) => cs.map((c) => (c.name === cat ? { ...c, fields: c.fields.includes(f) ? c.fields : [...c.fields, f] } : c)));
    setNewFieldByCat((s) => ({ ...s, [cat]: "" }));
  };

  const isCustom = (name: string) => !DEFAULT_CATEGORIES.some((c) => c.name === name);

  const removeCategory = (name: string) => {
    setCategories((cs) => cs.filter((c) => c.name !== name));
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
        {categories.map(({ name: section, fields }) => (
          <div key={section} className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-xl text-foreground">{section}</h3>
              {isCustom(section) && (
                <Button size="sm" variant="ghost" onClick={() => removeCategory(section)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
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
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Add custom field…"
                value={newFieldByCat[section] || ""}
                onChange={(e) => setNewFieldByCat((s) => ({ ...s, [section]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addField(section)}
                className="max-w-xs"
              />
              <Button size="sm" variant="outline" onClick={() => addField(section)}>
                <Plus className="h-4 w-4" /> Field
              </Button>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-primary/40 bg-card/30 p-6 backdrop-blur">
          <h3 className="mb-3 font-serif text-lg text-foreground">+ Add Custom Category</h3>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Powers & Abilities"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="max-w-md"
            />
            <Button onClick={addCategory} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { usePersisted } from "@/lib/persist";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const DEFAULTS = [
  "Time Period",
  "Geography",
  "Culture & Society",
  "Politics & Power System",
  "Magic or Technology Rules",
  "Economy",
  "Beliefs",
  "What makes this world unique",
  "What are the people like — what species",
];

export function WorldBuildingLab() {
  const [categories, setCategories] = usePersisted<string[]>("world.categories", DEFAULTS);
  const [values, setValues] = usePersisted<Record<string, string>>("world.values", {});
  const [newCat, setNewCat] = useState("");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat} className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-lg text-foreground">{cat}</h3>
              {!DEFAULTS.includes(cat) && (
                <button
                  onClick={() => setCategories((cs) => cs.filter((c) => c !== cat))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Textarea
              rows={4}
              value={values[cat] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [cat]: e.target.value }))}
              placeholder={`Describe the ${cat.toLowerCase()} of your world…`}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/20 p-4">
        <Input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Custom category name…"
          className="max-w-xs"
        />
        <Button
          variant="outline"
          className="border-silver"
          onClick={() => {
            if (newCat.trim()) {
              setCategories((cs) => [...cs, newCat.trim()]);
              setNewCat("");
            }
          }}
        >
          <Plus className="h-4 w-4" /> Add Custom Category
        </Button>
      </div>
    </div>
  );
}

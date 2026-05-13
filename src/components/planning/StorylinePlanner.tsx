import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function StorylinePlanner() {
  const [text, setText] = useState(
    "1. Opening — establish the world\n2. Inciting incident\n3. Rising action\n   - Subplot beat\n   - Subplot beat\n4. Midpoint twist\n5. Climax\n6. Resolution",
  );
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
      <h3 className="mb-3 font-serif text-xl text-foreground">Storyline</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Map your story beats with numbers and bullets. Plain, linear, your way.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={20}
        className="font-mono text-sm leading-relaxed"
      />
    </div>
  );
}

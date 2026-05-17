import { useEffect, useRef, useState } from "react";
import { usePersisted } from "@/lib/persist";
import { Stage, Layer, Text } from "react-konva";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const STAMPS = [
  { label: "Mountain", icon: "⛰️" },
  { label: "Castle", icon: "🏰" },
  { label: "Forest", icon: "🌲" },
  { label: "Village", icon: "🏘️" },
  { label: "Tower", icon: "🗼" },
  { label: "River", icon: "〰️" },
  { label: "Island", icon: "🏝️" },
  { label: "Volcano", icon: "🌋" },
  { label: "Sword", icon: "⚔️" },
  { label: "Skull", icon: "💀" },
  { label: "Compass", icon: "🧭" },
  { label: "Ship", icon: "⛵" },
];

type Placed = { id: string; icon: string; x: number; y: number };

export function FantasyMapBuilder() {
  const [items, setItems] = usePersisted<Placed[]>("map.items", []);
  const stageRef = useRef<any>(null);
  const dragIcon = useRef<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <aside className="rounded-xl border border-border/60 bg-card/40 p-3 backdrop-blur">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Stamps</p>
        <div className="grid grid-cols-3 gap-2">
          {STAMPS.map((s) => (
            <button
              key={s.label}
              draggable
              onDragStart={() => (dragIcon.current = s.icon)}
              title={s.label}
              className="flex aspect-square items-center justify-center rounded-lg border border-border/60 bg-background/60 text-2xl hover:border-primary/60 hover:bg-primary/10"
            >
              {s.icon}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => setItems([])}
        >
          <Trash2 className="h-4 w-4" /> Clear map
        </Button>
      </aside>

      <div
        className="relative overflow-hidden rounded-xl border border-border/60 bg-[radial-gradient(ellipse_at_center,oklch(0.20_0.02_290),oklch(0.10_0.01_285))]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          if (!dragIcon.current || !stageRef.current) return;
          const stage = stageRef.current;
          const rect = stage.container().getBoundingClientRect();
          setItems((it) => [
            ...it,
            { id: `${Date.now()}`, icon: dragIcon.current!, x: e.clientX - rect.left, y: e.clientY - rect.top },
          ]);
          dragIcon.current = null;
        }}
      >
        {mounted && (
          <Stage ref={stageRef} width={800} height={560} className="!h-[560px] !w-full">
            <Layer>
              {items.map((it) => (
                <Text
                  key={it.id}
                  x={it.x - 18}
                  y={it.y - 18}
                  text={it.icon}
                  fontSize={36}
                  draggable
                  onDblClick={() => setItems((all) => all.filter((a) => a.id !== it.id))}
                />
              ))}
            </Layer>
          </Stage>
        )}
        {items.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Drag stamps onto the canvas. Double-click a stamp to remove.
          </div>
        )}
      </div>
    </div>
  );
}

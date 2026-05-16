import { createFileRoute, Link } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { Sparkles, BookOpen, Layers, UserCheck, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useMode } from "@/lib/mode";
import { DailyMuse } from "@/components/DailyMuse";

export const Route = createFileRoute("/weave")({
  head: () => ({ meta: [{ title: "The Weaver's Path — Obsidian Siren Studio" }] }),
  component: WeavePage,
});

const stages = [
  { title: "The Spark", sub: "Planning & Drafting", desc: "Characters, worlds, story arcs. Where it all begins.", href: "/planning", Icon: BookOpen },
  { title: "The Sculpture", sub: "Book Formatting", desc: "Trim, typography, and gutter — make it a book.", href: "/formatting", Icon: Layers },
  { title: "The Vision", sub: "Cover Studio", desc: "Design the cover that calls readers in.", href: "/studio", Icon: Sparkles },
  { title: "The Final Polish", sub: "Expert Services", desc: "Editors, proofreaders, publishing pros.", href: "/sanctuary", Icon: UserCheck },
];

function WeavePage() {
  const [, setMode] = useMode();
  useEffect(() => { setMode("fiction"); }, [setMode]);

  return (
    <StudioLayout title="Weaver Dashboard">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <PageHeader topLabel="Creative Studio" bigTitle="The Weaver's Path" sub="Enter at any stage. The Siren keeps the threads of your journey." />
        <div className="mb-6"><DailyMuse /></div>
        <div className="mb-4 text-xs uppercase tracking-[0.3em] text-silver/70">Quick Start</div>
        <div className="grid gap-5 md:grid-cols-2">
          {stages.map((s) => (
            <Link key={s.href} to={s.href} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_20px_60px_-20px_oklch(0.58_0.22_295/0.45)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 opacity-30 blur-3xl transition-opacity group-hover:opacity-60" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  <s.Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-silver/70">{s.sub}</p>
                  <h3 className="mt-1 font-serif text-2xl text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </StudioLayout>
  );
}

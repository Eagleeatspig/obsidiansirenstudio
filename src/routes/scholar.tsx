import { createFileRoute, Link } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { FolderOpen, PenLine, Quote, UserCheck, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useMode } from "@/lib/mode";

export const Route = createFileRoute("/scholar")({
  head: () => ({ meta: [{ title: "The Scholar's Sanctum — Obsidian Siren Studio" }] }),
  component: ScholarPage,
});

const stages = [
  { title: "The Inquiry", sub: "Research Vault", desc: "Upload PDFs and source papers — your private library.", href: "/research/vault", Icon: FolderOpen },
  { title: "The Thesis", sub: "Scriptorium", desc: "Draft your manuscript with a Research Assistant by your side.", href: "/research/scriptorium", Icon: PenLine },
  { title: "The Citation", sub: "Citation Engine", desc: "MLA, APA, Chicago — perfectly formatted, instantly.", href: "/research/citations", Icon: Quote },
  { title: "The Defense", sub: "Expert Review", desc: "Get a scholar's eye on your manuscript before submission.", href: "/sanctuary", Icon: UserCheck },
];

function ScholarPage() {
  const [, setMode] = useMode();
  useEffect(() => { setMode("academic"); }, [setMode]);

  return (
    <StudioLayout title="Scholar Dashboard">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <PageHeader topLabel="Research Studio" bigTitle="The Scholar's Sanctum" sub="Enter at any stage. Sources stay private; the assistant only knows what you teach it." />
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

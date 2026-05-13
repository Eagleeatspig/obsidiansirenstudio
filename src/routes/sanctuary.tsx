import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useRef, useState } from "react";
import { Eye, BookOpen, Compass, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sanctuary")({
  head: () => ({
    meta: [
      { title: "Expert Sanctuary — Obsidian Siren Studio" },
      { name: "description", content: "Proofreading, developmental feedback, and publishing consultation from human experts." },
    ],
  }),
  component: SanctuaryPage,
});

const SERVICES = [
  { id: "proof", name: "Proofreading & Editing", icon: Eye, desc: "Focused on clarity, flow, and grammar.", rate: 0.015, unit: "per word" },
  { id: "dev", name: "Developmental Feedback", icon: BookOpen, desc: "Deep-dive expert advice on plot and structure.", rate: 0.025, unit: "per word" },
  { id: "pub", name: "Publishing Consultation", icon: Compass, desc: "1-on-1 session to navigate the industry.", rate: 150, unit: "flat" },
] as const;

function SanctuaryPage() {
  const [service, setService] = useState<(typeof SERVICES)[number]["id"]>("proof");
  const [words, setWords] = useState(50000);
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const total = useMemo(() => {
    const s = SERVICES.find((x) => x.id === service)!;
    if (s.unit === "flat") return s.rate;
    return s.rate * Math.max(0, words);
  }, [service, words]);

  return (
    <StudioLayout title="Expert Sanctuary">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Window IV</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">Expert Sanctuary</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            When the manuscript is ready, the right human eyes can change everything.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            const active = service === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setService(s.id)}
                className={`text-left rounded-2xl border p-6 backdrop-blur transition ${
                  active ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-siren)]" : "border-border/60 bg-card/40 hover:border-primary/40"
                }`}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl text-foreground">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <p className="mt-4 text-sm text-silver">
                  {s.unit === "flat" ? `$${s.rate} flat` : `$${s.rate.toFixed(3)} ${s.unit}`}
                </p>
              </button>
            );
          })}
        </div>

        {/* Calculator */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <h2 className="font-serif text-2xl text-foreground">Price Calculator</h2>
            <p className="mt-1 text-sm text-muted-foreground">Estimates update as you type.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Service</label>
                <Select value={service} onValueChange={(v) => setService(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Total Word Count</label>
                <Input type="number" min={0} value={words} onChange={(e) => setWords(+e.target.value || 0)} />
              </div>
            </div>

            <div className="mt-6 rounded-xl border-2 border-silver/60 bg-background/40 p-5">
              <p className="text-xs uppercase tracking-wider text-silver">Estimated Total</p>
              <p className="mt-2 font-serif text-4xl text-gradient-silver">
                ${total.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {SERVICES.find((s) => s.id === service)?.name} ·{" "}
                {SERVICES.find((s) => s.id === service)?.unit === "flat"
                  ? "flat fee"
                  : `${words.toLocaleString()} words`}
              </p>
            </div>
          </div>

          {/* Upload Portal */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <h2 className="font-serif text-2xl text-foreground">Secure Upload Portal</h2>
            <p className="mt-1 text-sm text-muted-foreground">Hand your manuscript to a vetted expert.</p>

            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) setFilename(f.name);
              }}
              className="mt-5 cursor-pointer rounded-xl border-2 border-dashed border-silver/40 bg-background/30 p-10 text-center hover:border-primary/60"
            >
              <Upload className="mx-auto h-7 w-7 text-silver" />
              <p className="mt-3 text-sm text-foreground">Drop manuscript here</p>
              <p className="text-xs text-muted-foreground">.doc · .docx · .pdf</p>
              {filename && <p className="mt-3 text-xs text-primary">Selected: {filename}</p>}
              <input
                ref={fileRef}
                type="file"
                accept=".doc,.docx,.pdf"
                hidden
                onChange={(e) => e.target.files?.[0] && setFilename(e.target.files[0].name)}
              />
            </div>

            <label className="mt-5 block text-xs uppercase tracking-wider text-muted-foreground">Notes for your Expert</label>
            <Textarea
              className="mt-2"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Genre, target audience, deadline, areas of concern…"
            />

            <Button
              className="mt-5 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground glow-siren"
              onClick={() => toast.success(`Request submitted — ${SERVICES.find((s) => s.id === service)?.name} · $${total.toFixed(2)}`)}
            >
              Submit to the Sanctuary
            </Button>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerFn } from "@tanstack/react-start";
import { researchAssistant } from "@/lib/research.functions";
import { webResearch } from "@/lib/muse.functions";
import { toast } from "sonner";
import { Sparkles, Globe, BookMarked } from "lucide-react";

export const Route = createFileRoute("/research/scriptorium")({
  head: () => ({ meta: [{ title: "Scriptorium — Scholar's Sanctum" }] }),
  component: ScriptoriumPage,
});

function ScriptoriumPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const [draft, setDraft] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("scriptorium.draft") ?? "" : ""));
  useEffect(() => { localStorage.setItem("scriptorium.draft", draft); }, [draft]);

  const askVault = useServerFn(researchAssistant);
  const askWeb = useServerFn(webResearch);
  const [q, setQ] = useState("");
  const [mode, setLocalMode] = useState<"vault" | "web">("vault");
  const [history, setHistory] = useState<{ q: string; a: string; mode: "vault" | "web" }[]>([]);
  const [busy, setBusy] = useState(false);

  const onAsk = async () => {
    if (!q.trim()) return;
    setBusy(true);
    try {
      const res = mode === "vault"
        ? await askVault({ data: { question: q } })
        : await askWeb({ data: { question: q } });
      setHistory((h) => [...h, { q, a: res.answer, mode }]);
      setQ("");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <StudioLayout title="Scriptorium">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageHeader topLabel="Writing Editor" bigTitle="The Scriptorium" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-2 backdrop-blur-xl">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Begin your thesis here…"
              className="min-h-[600px] resize-none border-0 bg-transparent font-serif text-base leading-relaxed focus-visible:ring-0"
            />
            <div className="border-t border-border/40 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-silver/60">
              {draft.split(/\s+/).filter(Boolean).length} words · autosaved
            </div>
          </div>

          <aside className="flex max-h-[700px] flex-col rounded-2xl border border-primary/30 bg-card/60 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-silver/80">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Research Assistant
            </div>
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-background/40 p-1">
              <button onClick={() => setLocalMode("vault")} className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${mode === "vault" ? "bg-primary/20 text-primary" : "text-silver/70 hover:text-foreground"}`}>
                <BookMarked className="h-3 w-3" /> Vault
              </button>
              <button onClick={() => setLocalMode("web")} className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${mode === "web" ? "bg-primary/20 text-primary" : "text-silver/70 hover:text-foreground"}`}>
                <Globe className="h-3 w-3" /> General
              </button>
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">
              {mode === "vault"
                ? <>Grounded in your <Link to="/research/vault" className="text-primary underline">Source Vault</Link>.</>
                : <>General scholarly synthesis. Claims marked <code className="text-primary">[verify]</code> need confirmation.</>}
            </p>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {history.length === 0 && <p className="text-xs text-muted-foreground">Ask anything about your sources.</p>}
              {history.map((h, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary">You · {h.mode}</p>
                  <p className="text-xs text-foreground">{h.q}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-silver/70">Siren</p>
                  <p className="whitespace-pre-wrap text-xs text-silver">{h.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAsk()}
                placeholder="What does Smith argue about…?" />
              <Button onClick={onAsk} disabled={busy} size="sm" className="w-full bg-gradient-to-r from-primary to-primary-glow">
                {busy ? "Reading sources…" : "Ask"}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </StudioLayout>
  );
}

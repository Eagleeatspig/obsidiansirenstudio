import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { dailyMuse } from "@/lib/muse.functions";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Muse = { prompt: string; image: string; whisper: string };

export function DailyMuse() {
  const ask = useServerFn(dailyMuse);
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `muse.${today}`;
  const [muse, setMuse] = useState<Muse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMuse = async (force = false) => {
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setMuse(JSON.parse(cached)); return; }
    }
    setLoading(true);
    try {
      const seed = force ? `${today}-${Date.now()}` : today;
      const res = await ask({ data: { seed } });
      setMuse(res as Muse);
      localStorage.setItem(cacheKey, JSON.stringify(res));
    } catch (e: any) {
      toast.error(e?.message || "The Siren is silent. Try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMuse(false); /* eslint-disable-next-line */ }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-card/80 via-card/60 to-primary/10 p-6 backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/30 opacity-40 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-silver/80">Daily Muse · {today}</p>
            <Button variant="ghost" size="sm" onClick={() => fetchMuse(true)} disabled={loading} className="h-7 px-2 text-xs">
              <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              New
            </Button>
          </div>
          {muse ? (
            <>
              <p className="mt-2 font-serif text-xl leading-snug text-foreground">"{muse.prompt}"</p>
              {muse.image && <p className="mt-2 text-sm italic text-silver/80">{muse.image}</p>}
              {muse.whisper && <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-primary/80">— {muse.whisper}</p>}
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{loading ? "The Siren is whispering…" : "Tap New to summon today's muse."}</p>
          )}
        </div>
      </div>
    </div>
  );
}

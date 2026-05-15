import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Feather, GraduationCap, ArrowRight, LogOut } from "lucide-react";
import logoHero from "@/assets/logo-hero.png";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Obsidian Siren Studio — Where stories find their shine" },
      { name: "description", content: "A dual-mode studio for fiction writers and academic scholars. Plan, draft, format, and publish your book." },
    ],
  }),
  component: Portal,
});

function Portal() {
  const { user, loading } = useAuth();
  return (
    <div className="film-grain relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.30_0.14_295/0.25),_transparent_70%)]" />

      <div className="relative w-full max-w-5xl text-center">
        <img
          src={logoHero}
          alt="Obsidian Siren Studio"
          className="mx-auto mb-6 w-72 max-w-full drop-shadow-[0_0_50px_oklch(0.58_0.22_295/0.55)] sm:w-96"
        />
        <p className="text-xs uppercase tracking-[0.4em] text-silver/80">Obsidian Siren Studio</p>
        <h1 className="mt-4 font-serif text-4xl italic leading-tight text-foreground sm:text-6xl">
          Where does your <span className="text-gradient-siren">journey</span> begin?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Two paths. One studio. Choose your craft and step through.
        </p>

        {!loading && !user && <SignInPanel />}
        {!loading && user && <SignedInBar email={user.email ?? ""} />}

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <PortalCard
            href="/weave"
            kicker="Fiction · Fantasy · Memoir"
            title="The Weaver's Path"
            blurb="Conjure characters, chart worlds, draft chapters, and design the cover that calls readers in."
            Icon={Feather}
          />
          <PortalCard
            href="/scholar"
            kicker="Research · Thesis · Academic"
            title="The Scholar's Sanctum"
            blurb="A vault for your sources, a scriptorium for your prose, and citations rendered in any house style."
            Icon={GraduationCap}
          />
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {user ? "You can switch paths anytime from the studio sidebar." : "Sign in is required to use the studio tools."}
        </p>
      </div>
    </div>
  );
}

function SignInPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onGoogle = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { setBusy(false); toast.error("Google sign-in failed"); return; }
    if (r.redirected) return;
    navigate({ to: "/" });
  };

  const onEmail = async () => {
    if (!email || !password) return toast.error("Email and password required");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back.");
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-primary/30 bg-card/60 p-5 backdrop-blur-xl">
      <Button onClick={onGoogle} disabled={busy} variant="outline" className="w-full border-silver text-silver">
        Continue with Google
      </Button>
      <div className="my-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-2">
        <Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={onEmail} disabled={busy} className="w-full bg-gradient-to-r from-primary to-primary-glow">
          Sign in with Email
        </Button>
        <Link to="/auth" className="block text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-primary">
          New here? Create an account →
        </Link>
      </div>
    </div>
  );
}

function SignedInBar({ email }: { email: string }) {
  return (
    <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-full border border-silver/30 bg-card/40 px-4 py-2 text-xs text-silver">
      <span className="opacity-80">Signed in as {email}</span>
      <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
        <LogOut className="h-3 w-3" /> Sign out
      </button>
    </div>
  );
}

function PortalCard({ href, kicker, title, blurb, Icon }: {
  href: string; kicker: string; title: string; blurb: string; Icon: any;
}) {
  return (
    <Link
      to={href}
      className="group relative overflow-hidden rounded-2xl border border-primary/25 bg-card/50 p-8 text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_30px_80px_-20px_oklch(0.58_0.22_295/0.5)]"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-primary/40 to-accent/10 opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60" />
      <div className="relative">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-silver/30 bg-gradient-to-br from-primary/20 to-transparent text-silver">
          <Icon className="h-7 w-7" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-silver/70">{kicker}</p>
        <h2 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
          Enter
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

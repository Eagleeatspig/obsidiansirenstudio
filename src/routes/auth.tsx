import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoMark from "@/assets/logo-mark.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Obsidian Siren Studio" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onSignIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/" });
  };

  const onSignUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { username },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to verify your account.");
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setBusy(false); toast.error("Google sign-in failed"); return; }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="film-grain flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/30 bg-card/70 p-8 backdrop-blur-xl shadow-[0_30px_80px_-20px_oklch(0.58_0.22_295/0.4)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logoMark} alt="Obsidian Siren" className="h-14 w-14 drop-shadow-[0_0_15px_oklch(0.58_0.22_295/0.7)]" />
          <h1 className="mt-3 font-serif text-3xl text-gradient-siren">Welcome back</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-silver/80">Obsidian Siren Studio</p>
        </div>

        <Button onClick={onGoogle} variant="outline" className="mb-4 w-full border-silver text-silver" disabled={busy}>
          Continue with Google
        </Button>
        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="signin" className="flex-1">Sign in</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="space-y-3">
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button onClick={onSignIn} disabled={busy} className="w-full bg-gradient-to-r from-primary to-primary-glow">Sign in</Button>
          </TabsContent>
          <TabsContent value="signup" className="space-y-3">
            <div><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button onClick={onSignUp} disabled={busy} className="w-full bg-gradient-to-r from-primary to-primary-glow">Create account</Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

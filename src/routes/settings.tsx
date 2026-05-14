import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Obsidian Siren Studio" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setUsername(data.username ?? "");
        setEmail(data.email ?? user.email ?? "");
        setTheme((data.theme as "dark" | "light") ?? "dark");
        document.documentElement.classList.toggle("light", data.theme === "light");
      }
    });
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id, username, email, theme,
    }, { onConflict: "user_id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    document.documentElement.classList.toggle("light", theme === "light");
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <StudioLayout title="Settings">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <PageHeader topLabel="Account Settings" bigTitle="The Atelier" sub="Tune the studio to your craft." />
        <div className="space-y-5 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <div><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
            <div>
              <Label className="text-sm">Light mode</Label>
              <p className="text-xs text-muted-foreground">Dark is the default; light is experimental.</p>
            </div>
            <Switch checked={theme === "light"} onCheckedChange={(c) => setTheme(c ? "light" : "dark")} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={onSave} disabled={saving} className="bg-gradient-to-r from-primary to-primary-glow">Save changes</Button>
            <Button onClick={onSignOut} variant="outline" className="border-silver text-silver">Sign out</Button>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}

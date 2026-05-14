import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Trash2 } from "lucide-react";

export const Route = createFileRoute("/research/vault")({
  head: () => ({ meta: [{ title: "Source Vault — Scholar's Sanctum" }] }),
  component: VaultPage,
});

type Source = { id: string; title: string; file_path: string; page_count: number | null; created_at: string };

function VaultPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sources, setSources] = useState<Source[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("research_sources").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setSources((data as Source[]) ?? []);
  };
  useEffect(() => { refresh(); }, [user]);

  const extractPdfText = async (file: File): Promise<{ text: string; pages: number }> => {
    const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const c = await page.getTextContent();
      text += `\n--- Page ${i} ---\n` + c.items.map((it: any) => it.str).join(" ");
    }
    return { text, pages: doc.numPages };
  };

  const onUpload = async (file: File) => {
    if (!user) return;
    setBusy(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("research-sources").upload(path, file);
      if (upErr) throw upErr;
      let text = ""; let pages = 0;
      try { ({ text, pages } = await extractPdfText(file)); }
      catch { toast.warning("PDF text extraction skipped (the assistant won't be able to cite this file)."); }
      const { error: dbErr } = await supabase.from("research_sources").insert({
        user_id: user.id, title: file.name, file_path: path, extracted_text: text, page_count: pages,
      });
      if (dbErr) throw dbErr;
      toast.success("Source added to vault.");
      refresh();
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setBusy(false); }
  };

  const onDelete = async (s: Source) => {
    await supabase.storage.from("research-sources").remove([s.file_path]);
    await supabase.from("research_sources").delete().eq("id", s.id);
    refresh();
  };

  return (
    <StudioLayout title="Source Vault">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <PageHeader topLabel="Research Vault" bigTitle="The Source Vault" sub="Private storage for research PDFs. Drop them in; the Research Assistant will use them." />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onUpload(f); }}
          onClick={() => inputRef.current?.click()}
          className="mb-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card/40 p-10 text-center transition-all hover:border-primary/70 hover:bg-card/60"
        >
          <Upload className="h-8 w-8 text-primary" />
          <p className="font-serif text-lg text-foreground">Drop a research PDF here</p>
          <p className="text-xs uppercase tracking-[0.3em] text-silver/70">or click to browse</p>
          <input ref={inputRef} type="file" accept="application/pdf" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
        </div>

        {busy && <p className="mb-4 text-center text-sm text-primary">Uploading & extracting…</p>}

        <div className="space-y-2">
          {sources.length === 0 && <p className="text-center text-sm text-muted-foreground">No sources yet.</p>}
          {sources.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-foreground">{s.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-silver/60">{s.page_count ? `${s.page_count} pages` : "indexed"}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDelete(s)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </StudioLayout>
  );
}

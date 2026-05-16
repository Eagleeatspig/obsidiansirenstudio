import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { PageHeader } from "@/components/PageHeader";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, Trash2, Plus, AlignLeft, AlignRight, AlignCenter, ImageIcon, BookOpen, Feather } from "lucide-react";

export const Route = createFileRoute("/writing")({
  head: () => ({ meta: [{ title: "Writing Suite — Obsidian Siren Studio" }] }),
  component: () => (
    <AuthGate>
      <WritingPage />
    </AuthGate>
  ),
});

type Chapter = { id: string; title: string; html: string };
type MediaItem = { path: string; url: string };

const LS_FREE = "writing.freeflow.html";
const LS_CHAPTERS = "writing.architect.chapters";

function WritingPage() {
  return (
    <StudioLayout title="Writing Suite">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageHeader topLabel="Planning & Drafting" bigTitle="The Writing Suite" sub="Free-Flow when the muse strikes. Manuscript Architect when it's time to build the book." />
        <Tabs defaultValue="free" className="mt-2">
          <TabsList className="bg-card/60 border border-border/60">
            <TabsTrigger value="free" className="gap-2"><Feather className="h-4 w-4" /> Free-Flow Canvas</TabsTrigger>
            <TabsTrigger value="architect" className="gap-2"><BookOpen className="h-4 w-4" /> Manuscript Architect</TabsTrigger>
          </TabsList>
          <TabsContent value="free" className="mt-6"><FreeFlow /></TabsContent>
          <TabsContent value="architect" className="mt-6"><Architect /></TabsContent>
        </Tabs>
      </div>
    </StudioLayout>
  );
}

/* ---------------- Media Vault ---------------- */
function useMediaVault() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.storage.from("manuscript-media").list(user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const mapped = await Promise.all((data ?? []).filter(f => f.name).map(async (f) => {
      const path = `${user.id}/${f.name}`;
      const { data: signed } = await supabase.storage.from("manuscript-media").createSignedUrl(path, 60 * 60);
      return { path, url: signed?.signedUrl ?? "" };
    }));
    setItems(mapped.filter(m => m.url));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const upload = async (file: File) => {
    if (!user) return null;
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("manuscript-media").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(error.message); return null; }
    await refresh();
    toast.success("Uploaded to Media Vault");
    return path;
  };

  const remove = async (path: string) => {
    const { error } = await supabase.storage.from("manuscript-media").remove([path]);
    if (error) { toast.error(error.message); return; }
    setItems((xs) => xs.filter((x) => x.path !== path));
  };

  return { items, loading, upload, remove, refresh };
}

function MediaVault({ onInsert }: { onInsert: (url: string) => void }) {
  const { items, loading, upload, remove } = useMediaVault();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /><h3 className="font-serif text-lg">Media Vault</h3></div>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="border-primary/40">
          <Upload className="h-4 w-4" /> Upload
        </Button>
        <input ref={fileRef} hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ""; }} />
      </div>
      <p className="mb-3 text-xs text-muted-foreground">Drag onto the page, or click to insert.</p>
      {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No illustrations yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((m) => (
            <div key={m.path} className="group relative overflow-hidden rounded-md border border-border/60">
              <img
                src={m.url}
                alt=""
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/uri-list", m.url)}
                onClick={() => onInsert(m.url)}
                className="aspect-square w-full cursor-pointer object-cover transition hover:scale-105"
              />
              <button onClick={() => remove(m.path)} className="absolute right-1 top-1 rounded bg-black/60 p-1 opacity-0 transition group-hover:opacity-100">
                <Trash2 className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Editor (contentEditable with image float) ---------------- */
function RichEditor({ value, onChange, placeholder, minH = 480 }: { value: string; onChange: (html: string) => void; placeholder?: string; minH?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
  }, [value]);

  const insertImage = useCallback((url: string, align: "left" | "right" | "center" = "left") => {
    if (!ref.current) return;
    ref.current.focus();
    const float = align === "center" ? "none" : align;
    const margin = align === "left" ? "0 1.25rem 0.75rem 0" : align === "right" ? "0 0 0.75rem 1.25rem" : "1rem auto";
    const display = align === "center" ? "block" : "inline";
    const html = `<img src="${url}" alt="" style="float:${float};display:${display};max-width:40%;border-radius:0.5rem;margin:${margin};box-shadow:0 8px 24px -12px rgba(0,0,0,0.6);" />`;
    document.execCommand("insertHTML", false, html);
    onChange(ref.current.innerHTML);
  }, [onChange]);

  // Expose insertImage via a stable ref
  (RichEditor as any).__lastInsert = insertImage;

  const onDrop = (e: React.DragEvent) => {
    const url = e.dataTransfer.getData("text/uri-list");
    if (!url) return;
    e.preventDefault();
    // place caret at drop position
    const range = (document as any).caretRangeFromPoint?.(e.clientX, e.clientY);
    if (range) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    insertImage(url, "left");
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
        <span className="mr-2 uppercase tracking-wider">Wrap:</span>
        <Button size="sm" variant="ghost" onClick={() => (RichEditor as any).__lastInsert?.(prompt("Image URL?") || "", "left")} className="hidden" />
        <span className="text-[10px]">Tip: click or drag an image from the Vault. Use the buttons above an image after inserting to re-wrap.</span>
      </div>
      <div className="rounded-xl border border-border/60 bg-background/40 p-4 focus-within:border-primary/50">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          data-placeholder={placeholder}
          className="prose prose-invert max-w-none font-serif text-base leading-relaxed text-foreground outline-none [&_img]:rounded-md empty:before:text-muted-foreground/60 empty:before:italic empty:before:content-[attr(data-placeholder)]"
          style={{ minHeight: minH }}
        />
      </div>
      <ImageToolbar editorRef={ref} onChange={onChange} />
    </div>
  );
}

function ImageToolbar({ editorRef, onChange }: { editorRef: React.RefObject<HTMLDivElement | null>; onChange: (html: string) => void }) {
  const [active, setActive] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "IMG") setActive(t as HTMLImageElement);
      else setActive(null);
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [editorRef]);

  if (!active) return null;

  const setAlign = (a: "left" | "right" | "center") => {
    if (a === "center") { active.style.float = "none"; active.style.display = "block"; active.style.margin = "1rem auto"; }
    else { active.style.float = a; active.style.display = "inline"; active.style.margin = a === "left" ? "0 1.25rem 0.75rem 0" : "0 0 0.75rem 1.25rem"; }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const remove = () => { active.remove(); setActive(null); if (editorRef.current) onChange(editorRef.current.innerHTML); };

  return (
    <div className="mt-2 flex items-center gap-1 rounded-md border border-primary/30 bg-card/60 p-1">
      <span className="px-2 text-xs text-silver">Selected image:</span>
      <Button size="sm" variant="ghost" onClick={() => setAlign("left")}><AlignLeft className="h-4 w-4" /></Button>
      <Button size="sm" variant="ghost" onClick={() => setAlign("center")}><AlignCenter className="h-4 w-4" /></Button>
      <Button size="sm" variant="ghost" onClick={() => setAlign("right")}><AlignRight className="h-4 w-4" /></Button>
      <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" /></Button>
    </div>
  );
}

/* ---------------- Free-Flow ---------------- */
function FreeFlow() {
  const [html, setHtml] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(LS_FREE) ?? "" : ""));
  useEffect(() => { localStorage.setItem(LS_FREE, html); }, [html]);
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Free-Flow Canvas</p>
          <span className="text-xs text-muted-foreground">{words} words · autosaved</span>
        </div>
        <RichEditor value={html} onChange={setHtml} placeholder="Let it flow. No chapters. No rules. Just the page and the pulse…" />
      </div>
      <MediaVault onInsert={(url) => (RichEditor as any).__lastInsert?.(url, "left")} />
    </div>
  );
}

/* ---------------- Manuscript Architect ---------------- */
function Architect() {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LS_CHAPTERS) || "[]"); } catch { return []; }
  });
  const [activeId, setActiveId] = useState<string | null>(chapters[0]?.id ?? null);

  useEffect(() => { localStorage.setItem(LS_CHAPTERS, JSON.stringify(chapters)); }, [chapters]);

  const addChapter = (section: "Front Matter" | "Chapter" | "Back Matter" = "Chapter") => {
    const c: Chapter = { id: crypto.randomUUID(), title: section === "Chapter" ? `Chapter ${chapters.filter(x => x.title.startsWith("Chapter")).length + 1}` : section, html: "" };
    setChapters((cs) => [...cs, c]);
    setActiveId(c.id);
  };

  const updateActive = (html: string) => setChapters((cs) => cs.map((c) => c.id === activeId ? { ...c, html } : c));
  const renameActive = (title: string) => setChapters((cs) => cs.map((c) => c.id === activeId ? { ...c, title } : c));
  const removeActive = () => { setChapters((cs) => cs.filter((c) => c.id !== activeId)); setActiveId(null); };

  const active = chapters.find((c) => c.id === activeId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
      {/* Outline */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-3 backdrop-blur">
        <p className="mb-2 px-1 text-xs uppercase tracking-[0.3em] text-primary">Outline</p>
        <div className="flex flex-col gap-1">
          {chapters.length === 0 && <p className="px-1 text-xs italic text-muted-foreground">No chapters yet.</p>}
          {chapters.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`rounded-md px-2 py-1.5 text-left text-sm transition ${activeId === c.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-card/70"}`}>
              {c.title}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <Button size="sm" variant="ghost" className="justify-start text-xs" onClick={() => addChapter("Front Matter")}><Plus className="h-3 w-3" /> Front Matter</Button>
          <Button size="sm" variant="ghost" className="justify-start text-xs" onClick={() => addChapter("Chapter")}><Plus className="h-3 w-3" /> Add Chapter</Button>
          <Button size="sm" variant="ghost" className="justify-start text-xs" onClick={() => addChapter("Back Matter")}><Plus className="h-3 w-3" /> Back Matter</Button>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur">
        {active ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <Input value={active.title} onChange={(e) => renameActive(e.target.value)} className="border-transparent bg-transparent font-serif text-xl focus-visible:border-primary/40" />
              <Button size="sm" variant="ghost" onClick={removeActive}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <RichEditor value={active.html} onChange={updateActive} placeholder="Begin the chapter…" />
          </>
        ) : (
          <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
            Add a chapter from the outline to begin.
          </div>
        )}
      </div>

      <MediaVault onInsert={(url) => (RichEditor as any).__lastInsert?.(url, "left")} />
    </div>
  );
}

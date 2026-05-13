import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useRef, useState, forwardRef, ReactNode } from "react";
import HTMLFlipBook from "react-pageflip";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/formatting")({
  head: () => ({
    meta: [
      { title: "Book Formatting — Obsidian Siren Studio" },
      { name: "description", content: "Live Style Engine: import your manuscript and preview as a 3D flip-book with genre presets." },
    ],
  }),
  component: FormattingPage,
});

type Genre = "fantasy" | "thriller" | "poetry";

const PRESETS: Record<Genre, { name: string; tag: string; pageStyle: React.CSSProperties; chapterStyle: React.CSSProperties; bodyStyle: React.CSSProperties; dropCap: boolean; ornate: boolean }> = {
  fantasy: {
    name: "Epic Fantasy",
    tag: "Merriweather · Parchment · Drop-cap",
    pageStyle: { background: "#fcf5e5", color: "#2b1d0e", fontFamily: "'Merriweather', serif" },
    chapterStyle: { fontFamily: "'Merriweather', serif", textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 24 },
    bodyStyle: { fontFamily: "'Merriweather', serif", fontSize: 14, lineHeight: 1.7, textAlign: "justify" },
    dropCap: true,
    ornate: true,
  },
  thriller: {
    name: "Modern Thriller",
    tag: "Montserrat · Dark · Tight lines",
    pageStyle: { background: "#1a1a1a", color: "#f4f4f4", fontFamily: "'Montserrat', sans-serif" },
    chapterStyle: { fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", fontSize: 22, fontWeight: 900, letterSpacing: "0.15em", marginBottom: 18 },
    bodyStyle: { fontFamily: "'Montserrat', sans-serif", fontSize: 13, lineHeight: 1.4, textAlign: "left" },
    dropCap: false,
    ornate: false,
  },
  poetry: {
    name: "Classic Poetry",
    tag: "Libre Baskerville · Centered · Wide margins",
    pageStyle: { background: "#f8f4ee", color: "#222", fontFamily: "'Libre Baskerville', serif" },
    chapterStyle: { fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", textAlign: "center", fontSize: 24, marginBottom: 28 },
    bodyStyle: { fontFamily: "'Libre Baskerville', serif", fontSize: 14, lineHeight: 1.9, textAlign: "center" },
    dropCap: false,
    ornate: false,
  },
};

const TRIM_SIZES = [
  { id: "5x8", label: "5\" × 8\" (Mass Market)", w: 360, h: 576 },
  { id: "6x9", label: "6\" × 9\" (Trade Paperback)", w: 400, h: 600 },
  { id: "7x10", label: "7\" × 10\" (Large)", w: 420, h: 600 },
];

const SAMPLE = `Chapter One
The Whisper of the Tide

The harbor was silent that morning. Mira pressed her palm to the cold stone, and the sea answered her with a hush that was not wind. Somewhere beneath the obsidian water, the Siren was singing a name she had not heard in twenty years.

She closed her eyes. She let herself listen.

Chapter Two
What the Lighthouse Knew

By dusk, the lighthouse keeper had not returned. His boots were still by the door, the lantern still trimmed, the kettle still warm. Mira lit the lamp herself and climbed the spiral stairs, two at a time, her heart already speaking in tides.

She did not know yet what waited at the top. But the door was open, and the wind was reading the keeper's journal aloud.

Chapter Three
The Bargain

"You are not the first," the voice said, "and you will not be the last." The candle guttered. Mira did not flinch. She had come to bargain, and she had brought her name in both hands.`;

type Page = { kind: "chapter" | "body"; lines: string[] };

function paginate(text: string): Page[] {
  const lines = text.split("\n");
  const pages: Page[] = [];
  let current: Page | null = null;
  for (const raw of lines) {
    const line = raw;
    if (/^Chapter\b/i.test(line.trim())) {
      // force a page break before chapter
      pages.push({ kind: "chapter", lines: [line] });
      current = { kind: "body", lines: [] };
      pages.push(current);
    } else {
      if (!current) {
        current = { kind: "body", lines: [] };
        pages.push(current);
      }
      current.lines.push(line);
    }
  }
  return pages.filter((p) => p.kind === "chapter" || p.lines.some((l) => l.trim()));
}

const FlipPage = forwardRef<HTMLDivElement, { children: ReactNode; style: React.CSSProperties }>(
  ({ children, style }, ref) => (
    <div ref={ref} style={style} className="overflow-hidden p-10 shadow-inner">
      {children}
    </div>
  ),
);
FlipPage.displayName = "FlipPage";

function PreviewPage({ page, preset, isFirstChapterBody }: { page: Page; preset: typeof PRESETS[Genre]; isFirstChapterBody: boolean }) {
  if (page.kind === "chapter") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        {preset.ornate && (
          <div className="mb-6 text-2xl tracking-[1em] opacity-60">❦ ❦ ❦</div>
        )}
        <h2 style={preset.chapterStyle}>{page.lines[0]}</h2>
        {preset.ornate && (
          <div className="mt-6 h-px w-32 bg-current opacity-40" />
        )}
      </div>
    );
  }
  const text = page.lines.join("\n").trim();
  const first = text.charAt(0);
  const rest = text.slice(1);
  return (
    <div style={preset.bodyStyle} className="h-full whitespace-pre-wrap">
      {isFirstChapterBody && preset.dropCap && first ? (
        <>
          <span style={{ float: "left", fontSize: 64, lineHeight: 0.9, paddingRight: 8, paddingTop: 4, fontWeight: 700 }}>
            {first}
          </span>
          {rest}
        </>
      ) : (
        text
      )}
    </div>
  );
}

function FormattingPage() {
  const [genre, setGenre] = useState<Genre>("fantasy");
  const [trim, setTrim] = useState("6x9");
  const [text, setText] = useState(SAMPLE);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pages = useMemo(() => paginate(text), [text]);
  const preset = PRESETS[genre];
  const dim = TRIM_SIZES.find((t) => t.id === trim)!;

  const onUpload = async (file: File) => {
    if (!file.name.endsWith(".docx") && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .docx or .txt file");
      return;
    }
    if (file.name.endsWith(".txt")) {
      setText(await file.text());
      toast.success("Imported");
    } else {
      // basic .docx fallback: extract visible XML text
      const buf = await file.arrayBuffer();
      const decoder = new TextDecoder();
      const raw = decoder.decode(buf);
      const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (stripped) setText(stripped);
      toast.success("Imported (basic .docx parsing). For full fidelity, paste your manuscript.");
    }
  };

  // mark the first body page after each chapter for drop-caps
  let lastWasChapter = false;
  const flagged = pages.map((p) => {
    const isFirst = p.kind === "body" && lastWasChapter;
    lastWasChapter = p.kind === "chapter";
    return { p, isFirst };
  });

  return (
    <StudioLayout title="Book Formatting">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Window II</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">The Style Engine</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A live, three-dimensional preview of your manuscript. Choose a genre — watch your book transform.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar: settings + presets */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur">
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Trim Size</p>
              <Select value={trim} onValueChange={setTrim}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIM_SIZES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur">
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Genre Preset</p>
              <div className="space-y-2">
                {(Object.keys(PRESETS) as Genre[]).map((k) => {
                  const p = PRESETS[k];
                  const active = genre === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setGenre(k)}
                      className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                        active ? "border-primary/60 bg-primary/10 ring-siren" : "border-border/60 bg-background/40 hover:border-primary/40"
                      }`}
                    >
                      <div className="font-serif text-sm text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.tag}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right: input + preview */}
          <div className="space-y-6">
            <Tabs defaultValue="suite" className="w-full">
              <TabsList>
                <TabsTrigger value="suite">Import from Writing Suite</TabsTrigger>
                <TabsTrigger value="upload">Upload Document (.docx)</TabsTrigger>
              </TabsList>
              <TabsContent value="suite" className="mt-3">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="font-mono text-xs"
                  placeholder="Paste manuscript text here. Lines starting with 'Chapter' will trigger a page break."
                />
              </TabsContent>
              <TabsContent value="upload" className="mt-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onUpload(f); }}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-card/30 p-10 text-center hover:border-primary/50"
                >
                  <Upload className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-3 text-sm text-foreground">Drop a .docx or .txt manuscript here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".docx,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Flipbook */}
            <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card/40 to-background/40 p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">3D Flip-book Preview</p>
                <p className="text-xs text-muted-foreground">{pages.length} pages · {preset.name}</p>
              </div>
              <div className="flex justify-center">
                {mounted && (
                  // @ts-expect-error react-pageflip types
                  <HTMLFlipBook
                    width={dim.w}
                    height={dim.h}
                    size="fixed"
                    showCover
                    maxShadowOpacity={0.6}
                    drawShadow
                    className="shadow-[var(--shadow-deep)]"
                  >
                    <FlipPage style={{ ...preset.pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div className="text-center">
                        <div className="font-serif text-3xl">Your Book</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.3em] opacity-60">{preset.name}</div>
                      </div>
                    </FlipPage>
                    {flagged.map(({ p, isFirst }, i) => (
                      <FlipPage key={i} style={preset.pageStyle}>
                        <PreviewPage page={p} preset={preset} isFirstChapterBody={isFirst} />
                      </FlipPage>
                    ))}
                    <FlipPage style={preset.pageStyle}>
                      <div className="flex h-full items-center justify-center text-center text-sm opacity-60">— End —</div>
                    </FlipPage>
                  </HTMLFlipBook>
                )}
              </div>
            </div>

            {/* Assisted formatting */}
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-gradient-to-br from-primary to-primary-glow p-3 text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-foreground">Expert Assisted Formatting</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hand your manuscript to a human typographer. We'll match your selected trim
                    ({TRIM_SIZES.find((t) => t.id === trim)?.label}) and {preset.name} style.
                  </p>
                  <div className="mt-4 cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-background/30 p-6 text-center hover:border-primary/50">
                    <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-sm">Upload manuscript for assisted formatting</p>
                  </div>
                  <Button
                    className="mt-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                    onClick={() => toast.success(`Manual formatting requested for ${dim.label} · ${preset.name}`)}
                  >
                    Request Manual Formatting
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}

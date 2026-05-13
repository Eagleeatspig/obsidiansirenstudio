import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useMemo, useRef, useState, forwardRef, ReactNode } from "react";
import HTMLFlipBook from "react-pageflip";
import { Upload, FileText, Info, Search, Sparkles, Columns3 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/formatting")({
  head: () => ({
    meta: [
      { title: "Pro-Formatting Suite — Obsidian Siren Studio" },
      { name: "description", content: "Industry-standard trim sizes, six genre presets, auto-headers, gutter safety, and a 3-way style comparison preview." },
    ],
  }),
  component: FormattingPage,
});

type Genre = "fantasy" | "thriller" | "poetry" | "literary" | "romance" | "academic";

type Preset = {
  name: string;
  tag: string;
  pageStyle: React.CSSProperties;
  chapterStyle: React.CSSProperties;
  bodyStyle: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  dropCap: boolean;
  dropCapMultiplier?: number;
  ornate: boolean;
  smallCaps?: boolean;
  numberedHeaders?: boolean;
  sidebar?: boolean;
};

const PRESETS: Record<Genre, Preset> = {
  fantasy: {
    name: "Epic Fantasy — The Tome",
    tag: "Playfair Display · Parchment · Drop-cap · Flourish",
    pageStyle: { background: "#fcf5e5", color: "#2b1d0e", fontFamily: "'Playfair Display', 'Merriweather', serif" },
    chapterStyle: { fontFamily: "'Playfair Display', serif", textAlign: "center", fontSize: 34, fontWeight: 700, marginBottom: 18 },
    bodyStyle: { fontFamily: "'Merriweather', serif", fontSize: 14, lineHeight: 1.7, textAlign: "justify" },
    dropCap: true,
    dropCapMultiplier: 3,
    ornate: true,
  },
  thriller: {
    name: "Modern Thriller — The Dossier",
    tag: "Montserrat · Dark mode · All-caps · Tight 1.2",
    pageStyle: { background: "#101010", color: "#ffffff", fontFamily: "'Montserrat', 'Inter', sans-serif" },
    chapterStyle: { fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", fontSize: 22, fontWeight: 900, letterSpacing: "0.18em", marginBottom: 18, textAlign: "left" },
    bodyStyle: { fontFamily: "'Inter', sans-serif", fontSize: 13, lineHeight: 1.2, textAlign: "left" },
    dropCap: false,
    ornate: false,
  },
  poetry: {
    name: "Classic Poetry — The Muse",
    tag: "Libre Baskerville · Centered · Wide margins",
    pageStyle: { background: "#f8f4ee", color: "#222", fontFamily: "'Libre Baskerville', serif", padding: "10% 22%" },
    chapterStyle: { fontFamily: "'Libre Baskerville', serif", fontStyle: "italic", textAlign: "center", fontSize: 24, marginBottom: 28 },
    bodyStyle: { fontFamily: "'Libre Baskerville', serif", fontSize: 14, lineHeight: 1.9, textAlign: "center" },
    dropCap: false,
    ornate: false,
  },
  literary: {
    name: "Literary Fiction — The Minimalist",
    tag: "EB Garamond · Small-caps · 1.5 line",
    pageStyle: { background: "#ffffff", color: "#1a1a1a", fontFamily: "'EB Garamond', 'Garamond', serif" },
    chapterStyle: { fontFamily: "'EB Garamond', serif", fontVariant: "small-caps", letterSpacing: "0.12em", textAlign: "left", fontSize: 20, fontWeight: 500, marginBottom: 20 },
    bodyStyle: { fontFamily: "'EB Garamond', serif", fontSize: 15, lineHeight: 1.5, textAlign: "left" },
    dropCap: false,
    ornate: false,
    smallCaps: true,
  },
  romance: {
    name: "Dark Romance — The Nocturne",
    tag: "Crimson Text · Plum dark · Script titles · 1.6 line",
    pageStyle: { background: "#1a0f1f", color: "#f3e8ff", fontFamily: "'Crimson Text', serif" },
    chapterStyle: { fontFamily: "'Dancing Script', cursive", textAlign: "center", fontSize: 38, fontWeight: 700, marginBottom: 24, color: "#e9d5ff" },
    bodyStyle: { fontFamily: "'Crimson Text', serif", fontSize: 15, lineHeight: 1.6, textAlign: "justify" },
    dropCap: false,
    ornate: false,
  },
  academic: {
    name: "Academic / Non-Fiction — The Authority",
    tag: "Lora · Numbered headers · Justified · Sidebar",
    pageStyle: { background: "#fdfdfb", color: "#1a1a1a", fontFamily: "'Lora', 'PT Serif', serif" },
    chapterStyle: { fontFamily: "'Lora', serif", textAlign: "left", fontSize: 22, fontWeight: 700, marginBottom: 16 },
    bodyStyle: { fontFamily: "'PT Serif', serif", fontSize: 13.5, lineHeight: 1.55, textAlign: "justify" },
    dropCap: false,
    ornate: false,
    numberedHeaders: true,
    sidebar: true,
  },
};

const TRIM_SIZES = [
  { id: "pocket", label: "Pocket — 4.25 × 6.87\"", w: 340, h: 550, gutter: 12, hint: "Best for mass-market fiction and travel companions." },
  { id: "novella", label: "Novella — 5 × 8\"", w: 360, h: 576, gutter: 14, hint: "Compact and versatile for shorter stories." },
  { id: "european", label: "European B-Format — 5.06 × 7.81\"", w: 365, h: 562, gutter: 14, hint: "Standard for UK and international literary fiction." },
  { id: "digest", label: "Digest — 5.5 × 8.5\"", w: 380, h: 588, gutter: 16, hint: "Standard for trade paperbacks and memoirs." },
  { id: "trade", label: "Trade — 6 × 9\"", w: 400, h: 600, gutter: 18, hint: "The most popular choice for novels and non-fiction." },
];

const SAMPLE = `Chapter One
The Whisper of the Tide

The harbor was silent that morning. Mira pressed her palm to the cold stone, and the sea answered her with a hush that was not wind. Somewhere beneath the obsidian water, the Siren was singing a name she had not heard in twenty years.

She closed her eyes. She let herself listen.

Chapter Two
What the Lighthouse Knew

By dusk, the lighthouse keeper had not returned. His boots were still by the door, the lantern still trimmed, the kettle still warm. Mira lit the lamp herself and climbed the spiral stairs, two at a time, her heart already speaking in tides.`;

type Page = { kind: "chapter" | "body"; lines: string[]; chapterNumber?: number };

function paginate(text: string): Page[] {
  const lines = text.split("\n");
  const pages: Page[] = [];
  let current: Page | null = null;
  let chapterCount = 0;
  for (const raw of lines) {
    const line = raw;
    if (/^Chapter\b/i.test(line.trim())) {
      chapterCount += 1;
      pages.push({ kind: "chapter", lines: [line], chapterNumber: chapterCount });
      current = { kind: "body", lines: [], chapterNumber: chapterCount };
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
    <div ref={ref} style={style} className="overflow-hidden shadow-inner">
      {children}
    </div>
  ),
);
FlipPage.displayName = "FlipPage";

function PreviewPageBody({
  page,
  preset,
  isFirstChapterBody,
  bookTitle,
  authorName,
  pageIndex,
  gutter,
}: {
  page: Page;
  preset: Preset;
  isFirstChapterBody: boolean;
  bookTitle: string;
  authorName: string;
  pageIndex: number;
  gutter: number;
}) {
  const isVerso = pageIndex % 2 === 1; // even page-index → verso (left)
  const headerLeft = isVerso ? authorName : "";
  const headerRight = isVerso ? "" : bookTitle;
  // Gutter applied on inside edge
  const padLeft = isVerso ? 36 : gutter + 24;
  const padRight = isVerso ? gutter + 24 : 36;

  const headerStyle: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    opacity: 0.55,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 18,
  };

  const folio = (
    <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontSize: 10, opacity: 0.5 }}>
      {pageIndex + 1}
    </div>
  );

  if (page.kind === "chapter") {
    return (
      <div style={{ position: "relative", height: "100%", paddingTop: 28, paddingBottom: 28, paddingLeft: padLeft, paddingRight: padRight }}>
        <div style={headerStyle}><span>{headerLeft}</span><span>{headerRight}</span></div>
        <div className="flex h-[80%] flex-col items-center justify-center text-center">
          {preset.ornate && <div className="mb-4 text-xl tracking-[1em] opacity-60">❦ ❦ ❦</div>}
          {preset.numberedHeaders && (
            <div style={{ fontSize: 12, letterSpacing: "0.3em", opacity: 0.5, marginBottom: 8 }}>
              {page.chapterNumber}.0
            </div>
          )}
          <h2 style={preset.chapterStyle}>{page.lines[0]}</h2>
          {preset.ornate && (
            <div className="mt-4 flex items-center gap-3 opacity-60">
              <div className="h-px w-16 bg-current" />
              <span>✦</span>
              <div className="h-px w-16 bg-current" />
            </div>
          )}
        </div>
        {folio}
      </div>
    );
  }
  const text = page.lines.join("\n").trim();
  const first = text.charAt(0);
  const rest = text.slice(1);
  const sub = preset.numberedHeaders && page.chapterNumber ? `${page.chapterNumber}.1 ` : "";
  return (
    <div style={{ position: "relative", height: "100%", paddingTop: 28, paddingBottom: 36, paddingLeft: padLeft, paddingRight: padRight, display: "flex", flexDirection: "column" }}>
      <div style={headerStyle}><span>{headerLeft}</span><span>{headerRight}</span></div>
      <div style={{ ...preset.bodyStyle, flex: 1, whiteSpace: "pre-wrap", display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          {sub && <span style={{ fontWeight: 700 }}>{sub}</span>}
          {isFirstChapterBody && preset.dropCap && first ? (
            <>
              <span style={{ float: "left", fontSize: (preset.bodyStyle.fontSize as number || 14) * (preset.dropCapMultiplier || 3), lineHeight: 0.9, paddingRight: 8, paddingTop: 4, fontWeight: 700 }}>
                {first}
              </span>
              {rest}
            </>
          ) : (
            text
          )}
        </div>
        {preset.sidebar && (
          <aside style={{ width: 90, fontSize: 9, lineHeight: 1.4, borderLeft: "1px solid currentColor", opacity: 0.6, paddingLeft: 8 }}>
            <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Key Takeaways</div>
            <div>Marginalia and citations appear here.</div>
          </aside>
        )}
      </div>
      {folio}
    </div>
  );
}

function MiniPreview({ preset, text, trimW, trimH }: { preset: Preset; text: string; trimW: number; trimH: number }) {
  const pages = paginate(text);
  const firstChapter = pages.find((p) => p.kind === "chapter");
  const firstBody = pages.find((p) => p.kind === "body");
  const scale = 0.7;
  return (
    <div className="space-y-2">
      <div className="text-center text-xs font-medium text-foreground">{preset.name}</div>
      <div className="text-center text-[10px] text-muted-foreground">{preset.tag}</div>
      <div className="flex justify-center gap-1" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <div style={{ ...preset.pageStyle, width: trimW * 0.55, height: trimH * 0.55, padding: 16, overflow: "hidden", borderRadius: 2 }}>
          {firstChapter && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              {preset.ornate && <div className="mb-2 text-xs tracking-[0.6em] opacity-60">❦ ❦</div>}
              <h2 style={{ ...preset.chapterStyle, fontSize: 16, marginBottom: 8 }}>{firstChapter.lines[0]}</h2>
              {preset.ornate && <div className="mt-2 h-px w-12 bg-current opacity-50" />}
            </div>
          )}
        </div>
        <div style={{ ...preset.pageStyle, width: trimW * 0.55, height: trimH * 0.55, padding: 16, overflow: "hidden", borderRadius: 2 }}>
          {firstBody && (
            <div style={{ ...preset.bodyStyle, fontSize: 9, lineHeight: 1.4 }}>
              {preset.dropCap && (
                <span style={{ float: "left", fontSize: 28, lineHeight: 0.9, paddingRight: 4, fontWeight: 700 }}>
                  {firstBody.lines.join(" ").trim().charAt(0)}
                </span>
              )}
              {firstBody.lines.join(" ").trim().slice(1, 320)}…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const GLOSSARY = [
  { term: "Bleed", def: "Printing that goes beyond the edge of where the sheet will be trimmed. Essential for images that reach the very edge of the page." },
  { term: "Trim Size", def: "The final physical dimensions of your book (e.g., 6\" × 9\") after it has been printed and cut." },
  { term: "Gutter", def: "The extra margin added to the inside of the page to ensure text doesn't get lost in the book's spine binding." },
  { term: "Leading (rhymes with wedding)", def: "The vertical space between lines of text. Proper leading prevents \"eye strain\" for the reader." },
  { term: "Drop Cap", def: "A large decorative capital letter at the beginning of a chapter that dips down into the lines of text below." },
  { term: "Recto & Verso", def: "Recto is the right-hand page (where chapters should always start); Verso is the left-hand page." },
  { term: "Widows & Orphans", def: "A \"Widow\" is a single line at the top of a page that belongs to a paragraph on the previous page. An \"Orphan\" is a single word at the bottom of a paragraph. Our tool automatically fixes these!" },
  { term: "Justification", def: "When text is aligned along both the left and right margins to create a clean, \"block\" look common in professional novels." },
  { term: "Running Head", def: "The small text at the top of a page that usually displays the Author Name or Book Title." },
  { term: "Folio", def: "The technical term for a page number." },
];

function FormattingPage() {
  const [genre, setGenre] = useState<Genre>("fantasy");
  const [trim, setTrim] = useState("trade");
  const [text, setText] = useState(SAMPLE);
  const [bookTitle, setBookTitle] = useState("Your Book");
  const [authorName, setAuthorName] = useState("Your Name");
  const [glossarySearch, setGlossarySearch] = useState("");
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
      const buf = await file.arrayBuffer();
      const decoder = new TextDecoder();
      const raw = decoder.decode(buf);
      const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (stripped) setText(stripped);
      toast.success("Imported (basic .docx parsing). For full fidelity, paste your manuscript.");
    }
  };

  let lastWasChapter = false;
  const flagged = pages.map((p) => {
    const isFirst = p.kind === "body" && lastWasChapter;
    lastWasChapter = p.kind === "chapter";
    return { p, isFirst };
  });

  const filteredGlossary = GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.def.toLowerCase().includes(glossarySearch.toLowerCase()),
  );

  const compareGenres: Genre[] = ["fantasy", "literary", "romance"];

  return (
    <StudioLayout title="Pro-Formatting Suite">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Window II</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">The Pro-Formatting Suite</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Industry-standard trim sizes, six genre presets, automatic gutter safety, and a 3-way style comparison — your manuscript, transformed in real time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Choose Your Trim Size</p>
              <Select value={trim} onValueChange={setTrim}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIM_SIZES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="mt-2 text-[11px] italic text-muted-foreground">{dim.hint}</p>
            </div>

            <div className="rounded-2xl border border-silver/40 bg-card/40 p-4 backdrop-blur">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Book & Author</p>
              <Input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="Book title" className="mb-2" />
              <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author name" />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Auto-header: <span className="text-foreground">{authorName}</span> on left pages · <span className="text-foreground">{bookTitle}</span> on right pages.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 backdrop-blur">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Gutter Safety (auto)</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    The inside margin is automatically increased to <span className="text-foreground">{dim.gutter}px</span> for this trim — preventing your text from disappearing into the book spine.
                  </p>
                </div>
              </div>
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

            {/* Compare Styles button */}
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-silver">
                    <Columns3 className="h-4 w-4" /> Compare Styles
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Three Vibes, One Page</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">Your first page rendered side-by-side in three styles — pick the one that feels like your book.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {compareGenres.map((g) => (
                      <button
                        key={g}
                        onClick={() => { setGenre(g); toast.success(`${PRESETS[g].name} applied`); }}
                        className="group rounded-xl border border-border/60 bg-card/40 p-4 text-left hover:border-primary/60"
                      >
                        <MiniPreview preset={PRESETS[g]} text={text} trimW={dim.w} trimH={dim.h} />
                        <div className="mt-2 text-center text-xs text-primary opacity-0 transition group-hover:opacity-100">Click to apply</div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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
                    <FlipPage style={{ ...preset.pageStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
                      <div className="text-center">
                        <div className="font-serif text-3xl">{bookTitle}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.3em] opacity-60">{authorName}</div>
                        <div className="mt-6 text-[10px] uppercase tracking-[0.3em] opacity-50">{preset.name}</div>
                      </div>
                    </FlipPage>
                    {flagged.map(({ p, isFirst }, i) => (
                      <FlipPage key={i} style={preset.pageStyle}>
                        <PreviewPageBody
                          page={p}
                          preset={preset}
                          isFirstChapterBody={isFirst}
                          bookTitle={bookTitle}
                          authorName={authorName}
                          pageIndex={i + 1}
                          gutter={dim.gutter}
                        />
                      </FlipPage>
                    ))}
                    <FlipPage style={{ ...preset.pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div className="text-center text-sm opacity-60">— End —</div>
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
                    ({dim.label}) and {preset.name} style.
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

            {/* Glossary */}
            <section className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-primary">Reference</p>
                  <h2 className="mt-1 font-serif text-2xl text-foreground">Formatting Glossary</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Speak the language of professional book design.</p>
                </div>
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Search terms…"
                    className="pl-9"
                  />
                </div>
              </div>

              {filteredGlossary.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No terms match "{glossarySearch}".</p>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {filteredGlossary.map((g) => (
                    <AccordionItem
                      key={g.term}
                      value={g.term}
                      className="rounded-lg border border-silver/40 bg-background/30 px-4 transition hover:border-primary/60 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)] data-[state=open]:border-primary/60"
                    >
                      <AccordionTrigger className="font-serif text-base text-primary hover:no-underline">
                        {g.term}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed" style={{ color: "#C0C0C0" }}>
                        {g.def}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-silver/60 bg-gradient-to-br from-background/60 to-card/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-silver" />
                  <p className="text-sm" style={{ color: "#C0C0C0" }}>
                    Still confused by the jargon? <span className="font-serif italic text-foreground">Let the Siren handle it.</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-silver text-foreground hover:bg-primary/10 hover:border-primary"
                  onClick={() => toast.success("Assisted Formatting requested — a Siren editor will reach out shortly.")}
                >
                  Request Assisted Formatting
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}

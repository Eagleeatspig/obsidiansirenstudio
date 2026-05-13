import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text as KText, Image as KImage } from "react-konva";
import { Sparkles, Brush, Eraser, Type as TypeIcon, Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateCoverPrompt } from "@/lib/cover.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "The Siren's Canvas — AI Cover Studio" },
      { name: "description", content: "Interview the Siren and generate a cover prompt, then refine your art on the digital canvas." },
    ],
  }),
  component: StudioPage,
});

const STEPS = [
  { key: "genre", label: "Genre & Mood", placeholder: "e.g. Grimdark fantasy, cozy mystery, romantasy…" },
  { key: "subject", label: "Main Subject", placeholder: "e.g. A hooded woman, a ruined castle, a glowing sword…" },
  { key: "environment", label: "Environmental Details", placeholder: "e.g. Midnight, underwater, forest fire…" },
  { key: "extra", label: "Anything else the Siren should know?", placeholder: "Open canvas. Whisper your vision…" },
] as const;

type Stroke = { tool: "brush" | "eraser"; color: string; size: number; points: number[] };
type TextItem = { id: string; x: number; y: number; text: string; size: number; color: string };

function StudioPage() {
  // Interview
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const generate = useServerFn(generateCoverPrompt);

  const [energy, setEnergy] = useState(5);

  const onGenerate = async () => {
    if (energy <= 0) { toast.error("No Siren Energy left today."); return; }
    setGenerating(true);
    try {
      const r = await generate({
        data: {
          genre: answers.genre || "",
          subject: answers.subject || "",
          environment: answers.environment || "",
          extra: answers.extra || "",
        },
      });
      setPrompt(r.prompt);
      setEnergy((e) => Math.max(0, e - 1));
      toast.success("The Siren has spoken.");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  // Canvas
  const [tool, setTool] = useState<"brush" | "eraser" | "text">("brush");
  const [color, setColor] = useState("#9D50BB");
  const [size, setSize] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const drawing = useRef(false);
  const stageRef = useRef<any>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onMouseDown = (e: any) => {
    if (tool === "text") {
      const pos = e.target.getStage().getPointerPosition();
      const t = prompt ? "Title" : "Your Title";
      setTexts((ts) => [...ts, { id: `${Date.now()}`, x: pos.x, y: pos.y, text: t, size: 36, color }]);
      return;
    }
    drawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setStrokes((s) => [...s, { tool, color, size, points: [pos.x, pos.y] }]);
  };
  const onMouseMove = (e: any) => {
    if (!drawing.current) return;
    const pos = e.target.getStage().getPointerPosition();
    setStrokes((s) => {
      const last = s[s.length - 1];
      const updated = { ...last, points: [...last.points, pos.x, pos.y] };
      return [...s.slice(0, -1), updated];
    });
  };
  const onMouseUp = () => { drawing.current = false; };

  const onUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => setBgImage(img);
    img.src = url;
  };

  return (
    <StudioLayout title="Siren's Canvas">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Siren Energy */}
        <div className="mb-6 rounded-2xl border border-primary/30 bg-card/40 p-4 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-[0.25em] text-primary">Siren Energy</span>
            </div>
            <span className="text-sm text-silver">{energy}/5 uses remaining today</span>
          </div>
          <Progress value={(energy / 5) * 100} className="bg-background/60" />
        </div>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Window III</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">The Siren's Canvas</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Whisper to the Siren. Then take a brush to her vision.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: AI Interactive Studio */}
          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-foreground">AI Interactive Studio</h2>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-5">
              <label className="text-xs uppercase tracking-wider text-primary">{STEPS[step].label}</label>
              {step === 3 ? (
                <Textarea
                  className="mt-2"
                  rows={4}
                  value={answers[STEPS[step].key] || ""}
                  placeholder={STEPS[step].placeholder}
                  onChange={(e) => setAnswers((a) => ({ ...a, [STEPS[step].key]: e.target.value }))}
                />
              ) : (
                <Input
                  className="mt-2"
                  value={answers[STEPS[step].key] || ""}
                  placeholder={STEPS[step].placeholder}
                  onChange={(e) => setAnswers((a) => ({ ...a, [STEPS[step].key]: e.target.value }))}
                />
              )}
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground" onClick={() => setStep((s) => s + 1)}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" disabled={generating} onClick={onGenerate} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground glow-siren">
                    {generating ? "Listening…" : "Generate Design"} <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border/60 bg-background/40 p-5">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">AI-generated cover prompt</p>
              <div className="min-h-[140px] whitespace-pre-wrap text-sm text-foreground">
                {prompt || <span className="text-muted-foreground italic">Your prompt will appear here once the Siren responds…</span>}
              </div>
            </div>

            <div className="mt-4 flex aspect-[2/3] items-center justify-center rounded-xl border border-dashed border-primary/30 bg-gradient-to-b from-primary/5 to-background/20 text-center text-sm text-muted-foreground">
              <div>
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary" />
                AI cover image preview placeholder
                <p className="mt-1 text-xs">Generated artwork will appear here.</p>
              </div>
            </div>
          </section>

          {/* Right: Digital Art Workspace */}
          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-foreground">Digital Art Workspace</h2>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                <span className="inline-flex items-center gap-2 rounded-md border border-silver px-3 py-2 text-sm text-silver hover:bg-card/70">
                  <Upload className="h-4 w-4" /> Upload to Edit
                </span>
              </label>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant={tool === "brush" ? "default" : "outline"} onClick={() => setTool("brush")}>
                <Brush className="h-4 w-4" /> Brush
              </Button>
              <Button size="sm" variant={tool === "eraser" ? "default" : "outline"} onClick={() => setTool("eraser")}>
                <Eraser className="h-4 w-4" /> Eraser
              </Button>
              <Button size="sm" variant={tool === "text" ? "default" : "outline"} onClick={() => setTool("text")}>
                <TypeIcon className="h-4 w-4" /> Text
              </Button>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-border" />
              <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(+e.target.value)} className="w-32" />
              <Button size="sm" variant="ghost" onClick={() => { setStrokes([]); setTexts([]); setBgImage(null); }}>Clear</Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/60 bg-[#0a0a0a]">
              <Stage
                ref={stageRef}
                width={520}
                height={680}
                className="!h-[680px] !w-full"
                onMouseDown={onMouseDown}
                onMousemove={onMouseMove}
                onMouseup={onMouseUp}
                onTouchStart={onMouseDown}
                onTouchMove={onMouseMove}
                onTouchEnd={onMouseUp}
              >
                <Layer>
                  {bgImage && <KImage image={bgImage} width={520} height={680} />}
                  {strokes.map((s, i) => (
                    <Line
                      key={i}
                      points={s.points}
                      stroke={s.color}
                      strokeWidth={s.size}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={s.tool === "eraser" ? "destination-out" : "source-over"}
                    />
                  ))}
                  {texts.map((t) => (
                    <KText
                      key={t.id}
                      x={t.x}
                      y={t.y}
                      text={t.text}
                      fontSize={t.size}
                      fontFamily="'Cormorant Garamond', serif"
                      fill={t.color}
                      draggable
                      onDblClick={() => {
                        const next = window.prompt("Edit text", t.text) ?? t.text;
                        setTexts((ts) => ts.map((x) => x.id === t.id ? { ...x, text: next } : x));
                      }}
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Double-click text to edit. Drag to reposition.</p>
          </section>
        </div>
      </div>
    </StudioLayout>
  );
}

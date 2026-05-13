import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Bold, Italic, List, ListOrdered, Heading1, Heading2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function WritingSuite() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<h1>Chapter One</h1><p>Begin your story here…</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[600px] focus:outline-none px-12 py-10 font-serif text-lg leading-relaxed",
      },
    },
    immediatelyRender: false,
  });

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => recognitionRef.current?.stop?.();
  }, []);

  const toggleMic = () => {
    const SR =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) {
      toast.error("Web Speech API not supported in this browser. Try Chrome.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) txt += e.results[i][0].transcript + " ";
      }
      if (txt && editor) editor.chain().focus().insertContent(txt).run();
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
    toast.success("Siren is listening…");
  };

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur">
      <div className="flex flex-wrap items-center gap-1 border-b border-border/60 px-3 py-2">
        <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button
            size="sm"
            onClick={toggleMic}
            className={listening ? "bg-primary text-primary-foreground glow-siren animate-pulse" : "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? "Stop dictation" : "Dictate"}
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

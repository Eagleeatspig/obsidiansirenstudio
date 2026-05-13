import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function SirensCallOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary/40 bg-gradient-to-b from-card to-background text-center sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-siren)]">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-serif text-3xl text-gradient-siren">
            The Siren's Call
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            One journey at a time, dear author. Your current story still sings — finish it, or
            <br />
            <span className="text-silver">upgrade to start a new journey.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Return to my book</Button>
          <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
            Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

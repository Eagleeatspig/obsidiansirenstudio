import { createFileRoute, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StubPage({ title, description }: { title: string; description: string }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{title}</span>
          </header>
          <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Coming soon</p>
            <h1 className="mt-4 font-serif text-5xl text-foreground">{title}</h1>
            <p className="mt-6 max-w-xl text-muted-foreground">{description}</p>
            <Button asChild variant="outline" className="mt-10 border-border/60">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to studio</Link>
            </Button>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

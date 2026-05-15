import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CurrencyProvider, CurrencyToggle } from "@/lib/currency";
import { AuthGate } from "@/components/AuthGate";

export function StudioLayout({ title, children, publicPage = false }: { title: string; children: ReactNode; publicPage?: boolean }) {
  const inner = (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{title}</span>
            <div className="ml-auto"><CurrencyToggle /></div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
  return (
    <CurrencyProvider>
      {publicPage ? inner : <AuthGate>{inner}</AuthGate>}
    </CurrencyProvider>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { BookOpen, Layers, Sparkles, UserCheck, ArrowRight, Feather } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logoHero from "@/assets/logo-hero.png";
import logoMark from "@/assets/logo-mark.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const windows = [
  {
    title: "Planning & Drafting",
    description:
      "Everything you need to plan your story. From character planning to world building, you can build your entire story here.",
    icon: BookOpen,
    href: "/planning",
    accent: "from-[oklch(0.58_0.22_295)] to-[oklch(0.35_0.15_290)]",
  },
  {
    title: "Book Formatting",
    description:
      "Do it yourself or get expert help. Use our self-formatting tool or assisted formatting services.",
    icon: Layers,
    href: "/formatting",
    accent: "from-[oklch(0.65_0.20_300)] to-[oklch(0.32_0.12_285)]",
  },
  {
    title: "AI Cover Design",
    description:
      "Are you a digital art expert or do you have an idea you want to create? Use our AI cover generator or design from scratch.",
    icon: Sparkles,
    href: "/studio",
    accent: "from-[oklch(0.72_0.18_305)] to-[oklch(0.40_0.18_295)]",
  },
  {
    title: "Expert Services",
    description:
      "Your book is your brainchild and deserves to be perfect. Find proofreaders, developmental editors, and learn what to do with your finished manuscript.",
    icon: UserCheck,
    href: "/sanctuary",
    accent: "from-[oklch(0.85_0.005_285)] to-[oklch(0.30_0.08_285)]",
  },
];

function Index() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary/20 bg-background/70 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-2">
                <img src={logoMark} alt="Obsidian Siren" className="h-10 w-10 object-contain drop-shadow-[0_0_10px_oklch(0.58_0.22_295/0.7)]" />
                <span className="hidden font-serif text-sm tracking-wider text-silver sm:inline">OBSIDIAN SIREN</span>
              </Link>
            </div>
            <nav className="hidden items-center gap-1 md:flex">
              {windows.map((w) => (
                <Link key={w.href} to={w.href} className="rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-silver/70 transition-colors hover:bg-primary/10 hover:text-primary">
                  {w.title.split(" ")[0]}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-silver hover:text-primary">
                Sign in
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                Get Started
              </Button>
            </div>
          </header>

          <main className="flex-1">
            {/* HERO */}
            <section className="relative overflow-hidden">
              <img
                src={heroBg}
                alt=""
                width={1920}
                height={1080}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
              <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
                <img
                  src={logoHero}
                  alt="Obsidian Siren Studio"
                  className="mx-auto mb-8 w-full max-w-md drop-shadow-[0_0_40px_oklch(0.58_0.22_295/0.5)]"
                />
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  A new chapter begins
                </div>
                <h1 className="text-balance font-serif text-5xl font-medium leading-[1.05] text-foreground sm:text-7xl md:text-[5.5rem]">
                  From Spark to Shine,
                  <br />
                  <span className="text-gradient-siren italic">the only friend</span>
                  <br />
                  you need to write and publish a book.
                </h1>
                <p className="mx-auto mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
                  Plan, draft, format, design, and polish — every craft of authorship,
                  whispered into one obsidian-dark studio.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="group bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-siren)] hover:opacity-95">
                    <Link to="/planning">
                      Begin Your Book
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-silver text-silver bg-card/40 backdrop-blur hover:bg-card/70 hover:text-silver">
                    <Link to="/sanctuary">Skip to Expert Services</Link>
                  </Button>
                </div>
              </div>
            </section>

            {/* WINDOWS */}
            <section className="relative mx-auto max-w-7xl px-6 pb-28">
              <div className="mb-12 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Four Windows</p>
                <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-5xl">
                  Step through, and the story begins.
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {windows.map((w) => (
                  <Link
                    key={w.title}
                    to={w.href}
                    className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur-xl ring-siren transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-siren)]"
                  >
                    {/* glow */}
                    <div
                      className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br ${w.accent} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                    />
                    {/* shimmer line */}
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex h-full flex-col">
                      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
                        <w.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                        {w.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {w.description}
                      </p>
                      <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Enter window
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <footer className="border-t border-border/40 py-10 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
              © Obsidian Siren Studio — Where stories find their shine.
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeader({ topLabel, bigTitle, sub }: { topLabel: string; bigTitle: string; sub?: string }) {
  return (
    <div className="mb-10">
      <p className="text-xs uppercase tracking-[0.35em] text-silver/80">{topLabel}</p>
      <h1 className="mt-2 font-serif text-4xl text-gradient-siren sm:text-6xl">{bigTitle}</h1>
      {sub && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

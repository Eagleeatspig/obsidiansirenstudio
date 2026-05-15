import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Currency = "USD" | "INR";
const RATE_INR_PER_USD = 84; // approximate display rate
const KEY = "obsidian.currency";

const Ctx = createContext<{ currency: Currency; setCurrency: (c: Currency) => void; format: (usd: number) => string }>({
  currency: "USD",
  setCurrency: () => {},
  format: (n) => `$${n}`,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  useEffect(() => {
    const v = (typeof window !== "undefined" && localStorage.getItem(KEY)) as Currency | null;
    if (v === "USD" || v === "INR") setCurrencyState(v);
  }, []);
  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") localStorage.setItem(KEY, c);
  };
  const format = (usd: number) => {
    if (currency === "INR") {
      const inr = Math.round(usd * RATE_INR_PER_USD);
      return `₹${inr.toLocaleString("en-IN")}`;
    }
    return `$${usd.toLocaleString("en-US")}`;
  };
  return <Ctx.Provider value={{ currency, setCurrency, format }}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  return useContext(Ctx);
}

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="inline-flex items-center rounded-md border border-silver/40 bg-card/40 p-0.5 text-[11px]">
      <button
        type="button"
        onClick={() => setCurrency("USD")}
        className={`px-2 py-1 rounded ${currency === "USD" ? "bg-primary/30 text-foreground" : "text-muted-foreground"}`}
      >
        $ USD
      </button>
      <button
        type="button"
        onClick={() => setCurrency("INR")}
        className={`px-2 py-1 rounded ${currency === "INR" ? "bg-primary/30 text-foreground" : "text-muted-foreground"}`}
      >
        ₹ INR
      </button>
    </div>
  );
}

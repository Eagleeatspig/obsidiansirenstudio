import { useEffect, useState } from "react";

export type StudioMode = "fiction" | "academic";
const KEY = "obsidian.mode";

export function getMode(): StudioMode {
  if (typeof window === "undefined") return "fiction";
  return (localStorage.getItem(KEY) as StudioMode) || "fiction";
}

export function useMode(): [StudioMode, (m: StudioMode) => void] {
  const [mode, setModeState] = useState<StudioMode>("fiction");
  useEffect(() => { setModeState(getMode()); }, []);
  const setMode = (m: StudioMode) => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, m);
    setModeState(m);
    window.dispatchEvent(new CustomEvent("obsidian-mode-changed"));
  };
  useEffect(() => {
    const handler = () => setModeState(getMode());
    window.addEventListener("obsidian-mode-changed", handler);
    return () => window.removeEventListener("obsidian-mode-changed", handler);
  }, []);
  return [mode, setMode];
}

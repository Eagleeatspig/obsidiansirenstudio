import { useEffect, useRef, useState } from "react";

const PREFIX = "obsidian.persist.";

export function loadPersisted<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePersisted<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* quota */ }
}

/**
 * Auto-persisted state. Saves debounced to localStorage and flushes on
 * page hide / before unload so refresh & close never lose work.
 */
export function usePersisted<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => loadPersisted<T>(key, initial));
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    const t = setTimeout(() => savePersisted(key, state), 300);
    return () => clearTimeout(t);
  }, [key, state]);

  useEffect(() => {
    const flush = () => savePersisted(key, latest.current);
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      flush();
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [key]);

  return [state, setState] as const;
}

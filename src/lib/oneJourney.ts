// Tracks the "One Journey" rule: free users can only have a single project.
const KEY = "obsidian.activeProjectId";

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function startNewProject(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, id);
}

export function canStartNewProject(intendedId: string) {
  const existing = getActiveProjectId();
  return !existing || existing === intendedId;
}

import { TUTORIAL_VERSION, type ContextualHintId, type TutorialStorage } from "./types";

const KEY = "das-kapitalist:tutorial:v1";

const empty = (): TutorialStorage => ({
  version: TUTORIAL_VERSION,
  completed: false,
  skipped: false,
  seenHints: [],
});

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadTutorialStorage(): TutorialStorage {
  const ls = safeLocalStorage();
  if (!ls) return empty();
  try {
    const raw = ls.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<TutorialStorage>;
    if (!parsed || parsed.version !== TUTORIAL_VERSION) return empty();
    return {
      version: TUTORIAL_VERSION,
      completed: !!parsed.completed,
      skipped: !!parsed.skipped,
      seenHints: Array.isArray(parsed.seenHints) ? (parsed.seenHints as ContextualHintId[]) : [],
    };
  } catch {
    return empty();
  }
}

export function saveTutorialStorage(data: TutorialStorage): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(KEY, JSON.stringify({ ...data, version: TUTORIAL_VERSION }));
  } catch {
    /* quota / privacy — ignore */
  }
}

export function clearTutorialStorage(): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

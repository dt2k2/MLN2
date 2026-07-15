import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearTutorialStorage,
  loadTutorialStorage,
  saveTutorialStorage,
} from "./storage";
import { TUTORIAL_VERSION } from "./types";

class MemoryStorage {
  store = new Map<string, string>();
  getItem(k: string) { return this.store.get(k) ?? null; }
  setItem(k: string, v: string) { this.store.set(k, v); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
  get length() { return this.store.size; }
}

const memStorage = new MemoryStorage();
beforeEach(() => {
  memStorage.clear();
  (globalThis as { window?: unknown }).window = { localStorage: memStorage };
});
afterEach(() => {
  memStorage.clear();
  delete (globalThis as { window?: unknown }).window;
});

describe("tutorial storage", () => {
  it("returns empty when nothing saved", () => {
    const s = loadTutorialStorage();
    expect(s.completed).toBe(false);
    expect(s.skipped).toBe(false);
    expect(s.seenHints).toEqual([]);
    expect(s.version).toBe(TUTORIAL_VERSION);
  });

  it("round-trips saved state", () => {
    saveTutorialStorage({
      version: TUTORIAL_VERSION,
      completed: true,
      skipped: false,
      seenHints: ["low-cash", "first-borrow"],
    });
    const s = loadTutorialStorage();
    expect(s.completed).toBe(true);
    expect(s.seenHints).toContain("low-cash");
  });

  it("discards data with a different version", () => {
    memStorage.setItem(
      "das-kapitalist:tutorial:v1",
      JSON.stringify({ version: 999, completed: true, seenHints: ["low-cash"] }),
    );
    const s = loadTutorialStorage();
    expect(s.completed).toBe(false);
  });

  it("clears saved state", () => {
    saveTutorialStorage({
      version: TUTORIAL_VERSION,
      completed: true,
      skipped: true,
      seenHints: [],
    });
    clearTutorialStorage();
    expect(loadTutorialStorage().completed).toBe(false);
  });
});

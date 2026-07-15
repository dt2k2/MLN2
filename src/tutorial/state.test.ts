import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useTutorialStore } from "./state";
import { TUTORIAL_STEPS } from "./steps";

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
  useTutorialStore.setState({
    active: false,
    stepIndex: 0,
    completed: false,
    skipped: false,
    seenHints: new Set(),
    pendingHint: null,
    askSkip: false,
  });
});
afterEach(() => {
  memStorage.clear();
  delete (globalThis as { window?: unknown }).window;
});

describe("tutorial state machine", () => {
  it("starts only for new players", () => {
    useTutorialStore.getState().start();
    expect(useTutorialStore.getState().active).toBe(true);
    useTutorialStore.setState({ completed: true, active: false });
    useTutorialStore.getState().start();
    expect(useTutorialStore.getState().active).toBe(false);
  });

  it("advances and reverses within bounds", () => {
    useTutorialStore.getState().start();
    useTutorialStore.getState().next();
    expect(useTutorialStore.getState().stepIndex).toBe(1);
    useTutorialStore.getState().previous();
    expect(useTutorialStore.getState().stepIndex).toBe(0);
    useTutorialStore.getState().previous();
    expect(useTutorialStore.getState().stepIndex).toBe(0);
  });

  it("completes on last step", () => {
    useTutorialStore.getState().start();
    useTutorialStore.setState({ stepIndex: TUTORIAL_STEPS.length - 1 });
    useTutorialStore.getState().next();
    expect(useTutorialStore.getState().active).toBe(false);
    expect(useTutorialStore.getState().completed).toBe(true);
  });

  it("skip requires confirmation and persists", () => {
    useTutorialStore.getState().start();
    useTutorialStore.getState().requestSkip();
    expect(useTutorialStore.getState().askSkip).toBe(true);
    useTutorialStore.getState().confirmSkip();
    expect(useTutorialStore.getState().active).toBe(false);
    expect(useTutorialStore.getState().skipped).toBe(true);
  });

  it("restart clears completion", () => {
    useTutorialStore.setState({ completed: true });
    useTutorialStore.getState().restart();
    expect(useTutorialStore.getState().active).toBe(true);
    expect(useTutorialStore.getState().completed).toBe(false);
  });

  it("onDecisionApplied only advances the apply step", () => {
    useTutorialStore.getState().start();
    // step 0 is manual; should not advance
    useTutorialStore.getState().onDecisionApplied();
    expect(useTutorialStore.getState().stepIndex).toBe(0);
    const applyIndex = TUTORIAL_STEPS.findIndex((s) => s.advance.kind === "decision-applied");
    useTutorialStore.setState({ stepIndex: applyIndex });
    useTutorialStore.getState().onDecisionApplied();
    expect(useTutorialStore.getState().stepIndex).toBe(applyIndex + 1);
  });

  it("triggerHint fires each id at most once", () => {
    useTutorialStore.setState({ completed: true });
    useTutorialStore.getState().triggerHint("low-cash");
    expect(useTutorialStore.getState().pendingHint).toBe("low-cash");
    useTutorialStore.getState().dismissHint();
    useTutorialStore.getState().triggerHint("low-cash");
    expect(useTutorialStore.getState().pendingHint).toBe(null);
  });

  it("does not trigger hints while tutorial is active", () => {
    useTutorialStore.getState().start();
    useTutorialStore.getState().triggerHint("low-cash");
    expect(useTutorialStore.getState().pendingHint).toBe(null);
  });
});

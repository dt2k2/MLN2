import { create } from "zustand";
import { TUTORIAL_STEPS, visiblePages } from "./steps";
import { CONTEXTUAL_HINTS } from "./hints";
import { clearTutorialStorage, loadTutorialStorage, saveTutorialStorage } from "./storage";
import { useGameStore } from "@/game/state";
import type { GameState } from "@/game/types";
import type { ContextualHintId, TutorialPage, TutorialStep } from "./types";

export interface TutorialState {
  active: boolean;
  stepIndex: number;
  pageIndex: number;
  completed: boolean;
  skipped: boolean;
  seenHints: Set<ContextualHintId>;
  pendingHint: ContextualHintId | null;
  askSkip: boolean;
  currentStep: () => TutorialStep | null;
  currentPage: (state?: GameState) => TutorialPage | null;
  start: () => void;
  next: () => void;
  previous: () => void;
  requestSkip: () => void;
  cancelSkip: () => void;
  confirmSkip: () => void;
  complete: () => void;
  restart: () => void;
  triggerHint: (id: ContextualHintId) => void;
  dismissHint: () => void;
  onDecisionApplied: () => void;
  onQuarterEnded: () => void;
}

const persist = (partial: {
  completed?: boolean;
  skipped?: boolean;
  seenHints?: Set<ContextualHintId>;
}) => {
  const cur = loadTutorialStorage();
  saveTutorialStorage({
    ...cur,
    completed: partial.completed ?? cur.completed,
    skipped: partial.skipped ?? cur.skipped,
    seenHints: partial.seenHints ? Array.from(partial.seenHints) : cur.seenHints,
  });
};

const getGameState = (): GameState | null => {
  try {
    return useGameStore.getState().state;
  } catch {
    return null;
  }
};

const initial = loadTutorialStorage();

export const useTutorialStore = create<TutorialState>((set, get) => ({
  active: false,
  stepIndex: 0,
  pageIndex: 0,
  completed: initial.completed,
  skipped: initial.skipped,
  seenHints: new Set(initial.seenHints),
  pendingHint: null,
  askSkip: false,

  currentStep: () => {
    const { active, stepIndex } = get();
    if (!active) return null;
    return TUTORIAL_STEPS[stepIndex] ?? null;
  },

  currentPage: (stateArg?: GameState) => {
    const step = get().currentStep();
    if (!step) return null;
    const s = stateArg ?? getGameState();
    const pages = s ? visiblePages(step, s) : step.pages;
    return pages[get().pageIndex] ?? pages[pages.length - 1] ?? null;
  },

  start: () => {
    const s = get();
    if (s.completed || s.skipped) return;
    set({ active: true, stepIndex: 0, pageIndex: 0 });
  },

  next: () => {
    const { stepIndex, pageIndex } = get();
    const step = TUTORIAL_STEPS[stepIndex];
    if (!step) return;
    const s = getGameState();
    const pages = s ? visiblePages(step, s) : step.pages;
    if (pageIndex + 1 < pages.length) {
      set({ pageIndex: pageIndex + 1 });
      return;
    }
    const nextIndex = stepIndex + 1;
    if (nextIndex >= TUTORIAL_STEPS.length) {
      get().complete();
      return;
    }
    set({ stepIndex: nextIndex, pageIndex: 0 });
  },

  previous: () => {
    const { stepIndex, pageIndex } = get();
    if (pageIndex > 0) {
      set({ pageIndex: pageIndex - 1 });
      return;
    }
    if (stepIndex <= 0) return;
    const prevStep = TUTORIAL_STEPS[stepIndex - 1];
    const s = getGameState();
    const pages = s ? visiblePages(prevStep, s) : prevStep.pages;
    set({ stepIndex: stepIndex - 1, pageIndex: Math.max(0, pages.length - 1) });
  },

  requestSkip: () => set({ askSkip: true }),
  cancelSkip: () => set({ askSkip: false }),

  confirmSkip: () => {
    persist({ skipped: true });
    set({ active: false, skipped: true, askSkip: false });
  },

  complete: () => {
    persist({ completed: true });
    set({ active: false, completed: true });
  },

  restart: () => {
    clearTutorialStorage();
    set({
      active: true,
      stepIndex: 0,
      pageIndex: 0,
      completed: false,
      skipped: false,
      seenHints: new Set(),
      pendingHint: null,
      askSkip: false,
    });
  },

  triggerHint: (id) => {
    const s = get();
    if (s.active || s.pendingHint) return;
    if (s.seenHints.has(id)) return;
    const seen = new Set(s.seenHints);
    seen.add(id);
    persist({ seenHints: seen });
    set({ seenHints: seen, pendingHint: id });
  },

  dismissHint: () => set({ pendingHint: null }),

  onDecisionApplied: () => {
    const { stepIndex, pageIndex } = get();
    const step = TUTORIAL_STEPS[stepIndex];
    if (!step || step.advance.kind !== "decision-applied") return;
    const s = getGameState();
    const pages = s ? visiblePages(step, s) : step.pages;
    if (pageIndex >= pages.length - 1) get().next();
  },

  onQuarterEnded: () => {
    const { stepIndex, pageIndex } = get();
    const step = TUTORIAL_STEPS[stepIndex];
    if (!step || step.advance.kind !== "quarter-ended") return;
    const s = getGameState();
    const pages = s ? visiblePages(step, s) : step.pages;
    if (pageIndex >= pages.length - 1) get().next();
  },
}));

export function hintFor(id: ContextualHintId) {
  return CONTEXTUAL_HINTS[id];
}

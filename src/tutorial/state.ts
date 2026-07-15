import { create } from "zustand";
import { TUTORIAL_STEPS } from "./steps";
import { CONTEXTUAL_HINTS } from "./hints";
import {
  clearTutorialStorage,
  loadTutorialStorage,
  saveTutorialStorage,
} from "./storage";
import type { ContextualHintId, TutorialStep } from "./types";

export interface TutorialState {
  active: boolean;
  stepIndex: number;
  completed: boolean;
  skipped: boolean;
  seenHints: Set<ContextualHintId>;
  pendingHint: ContextualHintId | null;
  askSkip: boolean;
  currentStep: () => TutorialStep | null;
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

const initial = loadTutorialStorage();

export const useTutorialStore = create<TutorialState>((set, get) => ({
  active: false,
  stepIndex: 0,
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

  start: () => {
    const s = get();
    if (s.completed || s.skipped) return;
    set({ active: true, stepIndex: 0 });
  },

  next: () => {
    const { stepIndex } = get();
    const nextIndex = stepIndex + 1;
    if (nextIndex >= TUTORIAL_STEPS.length) {
      get().complete();
      return;
    }
    set({ stepIndex: nextIndex });
  },

  previous: () => {
    const { stepIndex } = get();
    if (stepIndex <= 0) return;
    set({ stepIndex: stepIndex - 1 });
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
    const step = get().currentStep();
    if (step && step.advance.kind === "decision-applied") get().next();
  },

  onQuarterEnded: () => {
    const step = get().currentStep();
    if (step && step.advance.kind === "quarter-ended") get().next();
  },
}));

export function hintFor(id: ContextualHintId) {
  return CONTEXTUAL_HINTS[id];
}

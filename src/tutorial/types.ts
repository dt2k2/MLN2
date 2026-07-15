import type { DecisionGroupId } from "@/game/types";

export const TUTORIAL_VERSION = 1;

export type TutorialStepId =
  | "objective"
  | "cash-debt"
  | "indicators"
  | "decisions"
  | "preview"
  | "apply"
  | "end-quarter"
  | "summary";

export type TutorialTargetId =
  | "header-turn"
  | "header-cash"
  | "dashboard-grid"
  | "decision-panel"
  | "decision-tabs"
  | "end-quarter"
  | "log-panel";

export type TutorialAdvance =
  | { kind: "manual" }
  | { kind: "decision-applied" }
  | { kind: "quarter-ended" };

export interface TutorialStep {
  id: TutorialStepId;
  target: TutorialTargetId;
  title: string;
  body: string;
  advance: TutorialAdvance;
  openGroup?: DecisionGroupId;
  placement?: "auto" | "left" | "right" | "top" | "bottom";
}

export type ContextualHintId =
  | "low-cash"
  | "high-inventory"
  | "low-health"
  | "bought-machine"
  | "first-profit"
  | "first-borrow"
  | "first-event";

export interface ContextualHint {
  id: ContextualHintId;
  target: TutorialTargetId;
  title: string;
  body: string;
}

export interface TutorialStorage {
  version: number;
  completed: boolean;
  skipped: boolean;
  seenHints: ContextualHintId[];
}

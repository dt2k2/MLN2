import type { DecisionGroupId, GameState } from "@/game/types";

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
  | "header-fund"
  | "header-debt"
  | "header-next-interest"
  | "header-debt-ratio"
  | "dashboard-grid"
  | "market-firm-demand"
  | "market-demand-industry"
  | "market-supply-industry"
  | "market-output"
  | "market-price"
  | "market-share"
  | "market-group-demand"
  | "market-group-output"
  | "cvm-chart"
  | "profit-chart"
  | "contradiction"
  | "historical-scale"
  | "historical-scale-capital"
  | "historical-scale-labor"
  | "historical-scale-market"
  | "decision-panel"
  | "decision-tabs"
  | "end-quarter"
  | "log-panel";

export type TutorialAdvance =
  | { kind: "manual" }
  | { kind: "decision-applied" }
  | { kind: "quarter-ended" };

export type TutorialBody = string | ((state: GameState) => string);

export interface TutorialPage {
  target: TutorialTargetId;
  title: string;
  body: TutorialBody;
  placement?: "auto" | "left" | "right" | "top" | "bottom";
  /** Only include this page when the predicate returns true; evaluated against live game state. */
  showIf?: (state: GameState) => boolean;
  /** Anchor id in /how-to-play for a "Tìm hiểu thêm" deep link. */
  learnMoreAnchor?: string;
}

export interface TutorialStep {
  id: TutorialStepId;
  pages: TutorialPage[];
  advance: TutorialAdvance;
  openGroup?: DecisionGroupId;
}

export type ContextualHintId =
  | "low-cash"
  | "high-inventory"
  | "low-health"
  | "bought-machine"
  | "first-profit"
  | "first-borrow"
  | "first-event"
  | "scale-capital-high"
  | "scale-labor-high"
  | "scale-market-high"
  | "scale-multi-high";

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

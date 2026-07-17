export type Phase = "brief" | "interact" | "simulate" | "eureka" | "check" | "complete";
export type RoundId = 1 | 2 | 3 | 4 | 5 | 6;

export type ApprenticeshipConceptId =
  | "commodity"
  | "constantCapital"
  | "variableCapital"
  | "surplusValue"
  | "absoluteSurplus"
  | "surplusRate"
  | "socialLaborTime"
  | "relativeSurplus"
  | "overproduction"
  | "capitalAccumulation";

export interface RoundProgress {
  completed: boolean;
  attempts: number;
}

export interface ApprenticeshipState {
  currentRound: RoundId;
  phase: Phase;
  unlockedUpTo: RoundId;
  rounds: Record<RoundId, RoundProgress>;
}

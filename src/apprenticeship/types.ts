export type Phase = "brief" | "interact" | "simulate" | "eureka" | "check" | "complete";
export type RoundId = 1 | 2 | 3 | 4 | 5 | 6;

export type ApprenticeshipConceptId =
  | "commodity"
  | "constantCapital"
  | "variableCapital"
<<<<<<< HEAD
  | "surplusValue"
=======
  | "livingLabor"
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
  | "absoluteSurplus"
  | "surplusRate"
  | "socialLaborTime"
  | "relativeSurplus"
<<<<<<< HEAD
=======
  | "superProfit"
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
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

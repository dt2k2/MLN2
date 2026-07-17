import type { ApprenticeshipState, Phase, RoundId } from "./types";

<<<<<<< HEAD
export const PHASE_ORDER: Phase[] = [
  "brief",
  "interact",
  "simulate",
  "eureka",
  "check",
  "complete",
];
=======
export const PHASE_ORDER: Phase[] = ["brief", "interact", "simulate", "eureka", "check", "complete"];
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9

export function initialState(): ApprenticeshipState {
  return {
    currentRound: 1,
    phase: "brief",
    unlockedUpTo: 1,
    rounds: {
      1: { completed: false, attempts: 0 },
      2: { completed: false, attempts: 0 },
      3: { completed: false, attempts: 0 },
      4: { completed: false, attempts: 0 },
      5: { completed: false, attempts: 0 },
      6: { completed: false, attempts: 0 },
    },
  };
}

export type Action =
  | { type: "NEXT_PHASE" }
  | { type: "SET_PHASE"; phase: Phase }
  | { type: "RESET_ROUND" }
  | { type: "WRONG_ANSWER" }
  | { type: "COMPLETE_ROUND" }
  | { type: "GOTO_ROUND"; round: RoundId; dev?: boolean };

export function reducer(state: ApprenticeshipState, action: Action): ApprenticeshipState {
  switch (action.type) {
    case "NEXT_PHASE": {
      const idx = PHASE_ORDER.indexOf(state.phase);
      const next = PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)];
      return { ...state, phase: next };
    }
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "RESET_ROUND":
      return { ...state, phase: "brief" };
    case "WRONG_ANSWER":
      return {
        ...state,
        rounds: {
          ...state.rounds,
          [state.currentRound]: {
            ...state.rounds[state.currentRound],
            attempts: state.rounds[state.currentRound].attempts + 1,
          },
        },
      };
    case "COMPLETE_ROUND": {
      const cur = state.currentRound;
      const nextRound = Math.min(6, cur + 1) as RoundId;
      const wasLast = cur === 6;
      return {
        ...state,
        phase: wasLast ? "complete" : "brief",
        currentRound: wasLast ? cur : nextRound,
        unlockedUpTo: Math.max(state.unlockedUpTo, nextRound) as RoundId,
        rounds: {
          ...state.rounds,
          [cur]: { ...state.rounds[cur], completed: true },
        },
      };
    }
    case "GOTO_ROUND": {
      const allowed = action.dev || action.round <= state.unlockedUpTo;
      if (!allowed) return state;
      return { ...state, currentRound: action.round, phase: "brief" };
    }
    default:
      return state;
  }
}

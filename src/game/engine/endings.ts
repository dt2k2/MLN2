import { BAL } from "../balance";
import type { EndingId, GameState } from "../types";

export function checkEnding(s: GameState): EndingId | null {
  if (s.contradiction >= BAL.contradictionRevolution) return "revolution";
  if (s.unrest >= BAL.unrestRiot && s.riotStreak >= 2) return "revolution";
  if (s.cash <= -5000) return "bankruptcy";
  if (s.debtStressStreak >= 2) return "bankruptcy";
  if (s.turn >= BAL.maxTurns) {
    if (s.marketShare >= BAL.monopolyShare) return "monopoly";
    if (
      s.contradiction < BAL.reformContradictionMax &&
      s.health >= BAL.reformHealthMin &&
      s.last.profit > 0
    )
      return "reform";
    return "timeout";
  }
  return null;
}

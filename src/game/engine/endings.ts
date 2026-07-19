import { BAL } from "../balance";
import type { EndingId, GameState } from "../types";

export function checkEnding(s: GameState): EndingId | null {
  if (s.contradiction >= BAL.contradictionRevolution) return "revolution";
  if (s.unrest >= BAL.unrestRiot && s.riotStreak >= 3) return "revolution";
  if (s.cash <= BAL.bankruptcyCashFloor) return "bankruptcy";
  if (s.debtStressStreak >= BAL.bankruptcyStressTurns) return "bankruptcy";
  if (s.turn > BAL.maxTurns) {
    if (
      s.marketShare >= BAL.accumulationEndingShare &&
      s.machines >= BAL.accumulationEndingMachines
    )
      return "monopoly";
    if (
      s.contradiction < BAL.reformContradictionMax &&
      s.health >= BAL.reformHealthMin &&
      s.last.accountingProfit > 0
    )
      return "reform";
    return "timeout";
  }
  return null;
}

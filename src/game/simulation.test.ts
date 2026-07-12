import { describe, expect, it } from "vitest";
import { DECISIONS } from "./decisions";
import { advanceQuarter } from "./engine/tick";
import { initialState } from "./state";
import type { DecisionOptionId, GameState } from "./types";

type Policy = (state: GameState) => DecisionOptionId[];

const POLICIES: Record<string, Policy> = {
  cautious: (state) => [
    state.workHours > 8 ? "REDUCE_HOURS" : "REINVEST_75",
    state.debt > 0 && state.cash > 25_000 ? "REPAY_15000" : "REINVEST_75",
    state.workersActive < 32 ? "HIRE_WORKERS" : "REINVEST_75",
  ],
  reform: (state) => [
    state.workHours > 8 ? "REDUCE_HOURS" : state.turn % 4 === 0 ? "RAISE_WAGE" : "REINVEST_50",
    state.workersActive < 40 ? "HIRE_WORKERS" : "REINVEST_50",
    "REINVEST_50",
  ],
  investment: (state) => [
    state.turn % 4 === 1
      ? state.cash >= 18_000
        ? "BUY_MACHINE"
        : "BORROW"
      : state.debt > 0 && state.cash >= 15_000
        ? "REPAY_15000"
        : "REINVEST_100",
    "REINVEST_100",
    state.workersActive < 40 ? "HIRE_WORKERS" : "REINVEST_100",
  ],
  exploitation: () => ["EXTEND_HOURS", "CUT_WAGE", "LAYOFF"],
};

function play(seed: number, policy: Policy) {
  const state = initialState(seed);
  let hardStuck = false;
  while (!state.ending && state.turn <= 24) {
    const used = new Set<string>();
    for (const optionId of policy(state)) {
      const option = DECISIONS[optionId];
      if (used.size >= 3 || used.has(option.groupId) || !option.canApply(state)) continue;
      option.apply(state);
      used.add(option.groupId);
    }
    advanceQuarter(state);
    if (state.pendingEvent) {
      const choice = state.pendingEvent.choices.find(
        (candidate) => !candidate.canChoose || candidate.canChoose(state),
      );
      if (!choice) {
        hardStuck = true;
        break;
      }
      choice.apply(state);
      state.pendingEvent = null;
    }
  }
  return { state, hardStuck };
}

describe("balance simulation", () => {
  it("runs 10,000 seeded games without an event hard-stuck", () => {
    let stuck = 0;
    const phaseFour: Record<string, number> = {};
    for (const [name, policy] of Object.entries(POLICIES)) {
      let reached = 0;
      for (let seed = 1; seed <= 2_500; seed += 1) {
        const result = play(seed + name.length * 100_000, policy);
        if (result.hardStuck) stuck += 1;
        if (result.state.turn >= 19) reached += 1;
      }
      phaseFour[name] = reached / 2_500;
    }

    expect(stuck).toBe(0);
    expect(phaseFour.cautious).toBeGreaterThan(0.9);
    expect(phaseFour.reform).toBeGreaterThan(0.9);
    expect(phaseFour.investment).toBeGreaterThan(0.9);
  }, 20_000);
});

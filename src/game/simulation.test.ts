import { describe, expect, it } from "vitest";
import { BAL } from "./balance";
import { checkImmediateDiscoveries, checkQuarterDiscoveries } from "./concepts";
import { DECISIONS } from "./decisions";
import { advanceQuarter } from "./engine/tick";
import { checkEnding } from "./engine/endings";
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
  expansion: (state) => [
    state.cash >= BAL.machinePrice ? "BUY_MACHINE" : "BORROW",
    "REINVEST_100",
    state.turn === 1 ? "LAYOFF" : state.workersActive < 48 ? "HIRE_WORKERS" : "EXTEND_HOURS",
  ],
  dominance: (state) => [
    state.machines < 9
      ? state.cash >= BAL.machinePrice
        ? "BUY_MACHINE"
        : "BORROW"
      : state.debt > 0 && state.cash >= 20_000
        ? "REPAY_15000"
        : "REINVEST_100",
    "REINVEST_100",
    state.workersActive < 40
      ? "HIRE_WORKERS"
      : state.workHours > 10
        ? "REDUCE_HOURS"
        : "REINVEST_100",
  ],
  curriculum: (state) => {
    if (state.turn === 1) return [];
    if (state.turn === 2) return ["EXTEND_HOURS", "CUT_WAGE", "LAYOFF"];
    if (state.turn === 3) return ["BUY_MACHINE", "REINVEST_100", "HIRE_WORKERS"];
    if (state.turn === 4) return ["REDUCE_HOURS", "RAISE_WAGE", "REINVEST_100"];
    if (state.turn >= 12 && state.turn <= 18) {
      return [
        state.cash >= BAL.machinePrice ? "BUY_MACHINE" : "BORROW",
        "REINVEST_100",
        state.workersActive < 48 ? "HIRE_WORKERS" : "RAISE_WAGE",
      ];
    }
    return [
      state.debt > 0 && state.cash >= 20_000 ? "REPAY_15000" : "REINVEST_100",
      "REINVEST_100",
      state.workersActive < 40 ? "HIRE_WORKERS" : "RAISE_WAGE",
    ];
  },
  exploitation: () => ["EXTEND_HOURS", "CUT_WAGE", "LAYOFF"],
};

function play(seed: number, policy: Policy) {
  const state = initialState(seed);
  let hardStuck = false;
  while (!state.ending && state.turn <= 24) {
    const used = new Set<string>();
    const workersAtTurnStart = state.workersActive;
    for (const optionId of policy(state)) {
      const option = DECISIONS[optionId];
      if (used.size >= 3 || used.has(option.groupId) || !option.canApply(state)) continue;
      const previous = { ...state, discoveredConcepts: { ...state.discoveredConcepts } };
      option.apply(state);
      for (const discovery of checkImmediateDiscoveries({
        prev: previous,
        next: state,
        cause: "decision",
        workersAtTurnStart,
        discovered: previous.discoveredConcepts,
      })) {
        state.discoveredConcepts[discovery.key] = discovery;
      }
      used.add(option.groupId);
    }
    advanceQuarter(state);
    for (const discovery of checkQuarterDiscoveries(state)) {
      state.discoveredConcepts[discovery.key] = discovery;
    }
    if (state.pendingEvent) {
      const previous = { ...state, discoveredConcepts: { ...state.discoveredConcepts } };
      const choice =
        state.pendingEvent.id === "krupp-merger"
          ? state.pendingEvent.choices[1]
          : state.pendingEvent.choices.find(
              (candidate) => !candidate.canChoose || candidate.canChoose(state),
            );
      if (!choice) {
        hardStuck = true;
        break;
      }
      choice.apply(state);
      state.pendingEvent = null;
      for (const discovery of checkImmediateDiscoveries({
        prev: previous,
        next: state,
        cause: "event",
        workersAtTurnStart,
        discovered: previous.discoveredConcepts,
      })) {
        state.discoveredConcepts[discovery.key] = discovery;
      }
      if (!state.ending) state.ending = checkEnding(state);
    }
  }
  return { state, hardStuck };
}

describe("balance simulation", () => {
  it("runs 10,500 seeded games without a hard-stuck and keeps endings distinct", () => {
    let stuck = 0;
    const phaseFour: Record<string, number> = {};
    const endings: Record<string, Record<string, number>> = {};
    const maxConcepts: Record<string, number> = {};
    for (const [name, policy] of Object.entries(POLICIES)) {
      let reached = 0;
      let concepts = 0;
      endings[name] = {};
      for (let seed = 1; seed <= 1_500; seed += 1) {
        const result = play(seed + name.length * 100_000, policy);
        if (result.hardStuck) stuck += 1;
        if (result.state.turn >= 19) reached += 1;
        const ending = result.state.ending ?? "none";
        endings[name][ending] = (endings[name][ending] ?? 0) + 1;
        const keys = Object.keys(result.state.discoveredConcepts);
        concepts = Math.max(concepts, keys.length);
      }
      phaseFour[name] = reached / 1_500;
      maxConcepts[name] = concepts;
    }

    expect(stuck).toBe(0);
    expect(phaseFour.cautious).toBeGreaterThan(0.9);
    expect(phaseFour.reform).toBeGreaterThan(0.9);
    expect(phaseFour.investment).toBeGreaterThan(0.9);
    expect(phaseFour.expansion).toBeGreaterThan(0.9);
    expect(phaseFour.dominance).toBeGreaterThan(0.9);
    expect(endings.exploitation.revolution).toBe(1_500);
    expect(endings.reform.reform).toBeGreaterThan(100);
    expect(endings.investment.monopoly).toBeGreaterThan(900);
    expect(endings.expansion.bankruptcy).toBeGreaterThan(600);
    expect(maxConcepts.expansion).toBe(15);
  }, 30_000);
});

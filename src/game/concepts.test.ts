import { describe, expect, it } from "vitest";
import { produce } from "immer";
import { checkActionDiscoveries, checkQuarterDiscoveries, CONCEPT_KEYS } from "./concepts";
import { DECISIONS } from "./decisions";
import { initialState } from "./state";
import type { DecisionOptionId, GameState, QuarterRecord } from "./types";

function record(overrides: Partial<QuarterRecord> = {}): QuarterRecord {
  return { ...initialState(1).last, turn: 12, output: 900, v: 5_000, ...overrides };
}

function afterDecision(optionId: DecisionOptionId, state = initialState(1)) {
  return produce(state, (draft) => DECISIONS[optionId].apply(draft));
}

describe("concept discovery", () => {
  it("unlocks machinery concepts after productivity actually rises", () => {
    const previous = initialState(1);
    const next = afterDecision("BUY_MACHINE", previous);
    const discoveries = checkActionDiscoveries({
      prev: previous,
      next,
      actionId: "BUY_MACHINE",
      investmentThisTurn: 0,
      layoffsThisTurn: 0,
      workersAtTurnStart: previous.workersActive,
      discovered: {},
    });
    expect(discoveries.map((item) => item.key)).toEqual(["constantCapital", "relativeSurplus"]);
  });

  it("uses a strict greater-than twenty percent layoff threshold", () => {
    const previous = initialState(1);
    const next = afterDecision("LAYOFF", previous);
    const discoveries = checkActionDiscoveries({
      prev: previous,
      next,
      actionId: "LAYOFF",
      investmentThisTurn: 0,
      layoffsThisTurn: 8,
      workersAtTurnStart: 32,
      discovered: {},
    });
    expect(discoveries.some((item) => item.key === "reserveArmy")).toBe(true);
  });

  it("requires both industry overproduction and high firm inventory", () => {
    const state = initialState(1);
    state.history = [
      record({
        inventory: 800,
        demand: 1_000,
        industrySupply: 4_500,
        effectiveDemand: 4_000,
      }),
    ];
    expect(checkQuarterDiscoveries(state).some((item) => item.key === "overproductionCrisis")).toBe(
      true,
    );
    state.history[0].industrySupply = 3_500;
    expect(checkQuarterDiscoveries(state).some((item) => item.key === "overproductionCrisis")).toBe(
      false,
    );
  });

  it("needs four strict records for three consecutive profit-rate falls", () => {
    const state = initialState(1);
    state.history = [0.4, 0.3, 0.2].map((profitRate, index) =>
      record({ turn: index + 1, profitRate }),
    );
    expect(checkQuarterDiscoveries(state).some((item) => item.key === "fallingProfitRate")).toBe(
      false,
    );
    state.history.push(record({ turn: 4, profitRate: 0.1 }));
    expect(checkQuarterDiscoveries(state).some((item) => item.key === "fallingProfitRate")).toBe(
      true,
    );
  });

  it("can return every simultaneous new concept without duplicates", () => {
    const state: GameState = initialState(1);
    state.contradiction = 80;
    state.history = [
      record({ turn: 9, profitRate: 0.5 }),
      record({ turn: 10, profitRate: 0.4 }),
      record({ turn: 11, profitRate: 0.3 }),
      record({
        turn: 12,
        c: 20_000,
        v: 5_000,
        m: 7_000,
        profit: 6_000,
        reinvestedProfit: 4_500,
        ownerConsumption: 1_500,
        exploitation: 1.4,
        organic: 4,
        profitRate: 0.2,
        individualLaborTime: 7,
        socialLaborTime: 6,
        inventory: 900,
        demand: 1_000,
        industrySupply: 5_000,
        effectiveDemand: 4_000,
      }),
    ];
    const keys = checkQuarterDiscoveries(state).map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("capitalAccumulation");
    expect(keys).toContain("fallingProfitRate");
    expect(CONCEPT_KEYS).toHaveLength(15);
  });
});

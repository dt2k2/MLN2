import { describe, expect, it } from "vitest";
import { ACTIONS } from "./actions";
import { checkActionDiscoveries, checkQuarterDiscoveries } from "./concepts";
import { initialState } from "./state";
import type { ActionId, GameState, QuarterRecord } from "./types";

function record(overrides: Partial<QuarterRecord> = {}): QuarterRecord {
  return {
    turn: 1,
    year: 1857,
    quarter: 3,
    c: 100,
    v: 100,
    m: 50,
    W: 300,
    profit: 100,
    profitRate: 0.25,
    profitRateReal: 0.5,
    exploitation: 0.5,
    organic: 1,
    contradiction: 20,
    unrest: 15,
    health: 80,
    output: 100,
    demand: 100,
    inventory: 10,
    sellPrice: 38,
    materialPrice: 8,
    laborProductivity: 0.14,
    individualLaborTime: 7,
    socialLaborTime: 7.3,
    ...overrides,
  };
}

function quarterKeys(state: GameState) {
  return checkQuarterDiscoveries(state).map((item) => item.key);
}

function actionState(actionId: ActionId, overrides: Partial<GameState> = {}) {
  const prev = { ...initialState(1), ...overrides };
  const next = structuredClone(prev);
  ACTIONS[actionId].apply(next);
  return { prev, next };
}

describe("quarter concept triggers", () => {
  it("returns every newly observed concept in the same quarter", () => {
    const state = initialState(1);
    state.contradiction = 76;
    state.history = [
      record({
        v: 100,
        m: 120,
        profit: 80,
        exploitation: 1.2,
        organic: 3.1,
        inventory: 71,
        individualLaborTime: 7.5,
        socialLaborTime: 7,
      }),
    ];

    expect(quarterKeys(state)).toEqual(
      expect.arrayContaining([
        "commodity",
        "socialLabor",
        "variableCapital",
        "surplusValue",
        "surplusRate",
        "organicComposition",
        "overproductionCrisis",
        "capitalistContradiction",
      ]),
    );
  });

  it("uses strict thresholds and never rediscovers an unlocked concept", () => {
    const state = initialState(1);
    state.contradiction = 75;
    state.history = [record({ exploitation: 1, organic: 3, inventory: 70, demand: 100 })];
    state.discoveredConcepts.commodity = {
      key: "commodity",
      turn: 1,
      quarter: 3,
      year: 1857,
      action: "test",
      consequence: "test",
    };

    const keys = quarterKeys(state);
    expect(keys).not.toContain("commodity");
    expect(keys).not.toContain("surplusRate");
    expect(keys).not.toContain("organicComposition");
    expect(keys).not.toContain("overproductionCrisis");
    expect(keys).not.toContain("capitalistContradiction");
  });

  it("unlocks profit rate only on a decline from turn 12", () => {
    const state = initialState(1);
    state.history = [record({ turn: 11, profitRate: 0.3 }), record({ turn: 12, profitRate: 0.2 })];
    expect(quarterKeys(state)).toContain("profitRate");

    state.history[1] = record({ turn: 11, profitRate: 0.2 });
    expect(quarterKeys(state)).not.toContain("profitRate");
  });

  it("requires four records for three consecutive profit-rate declines", () => {
    const state = initialState(1);
    state.history = [
      record({ turn: 9, profitRate: 0.4 }),
      record({ turn: 10, profitRate: 0.3 }),
      record({ turn: 11, profitRate: 0.2 }),
    ];
    expect(quarterKeys(state)).not.toContain("fallingProfitRate");

    state.history.push(record({ turn: 12, profitRate: 0.1 }));
    expect(quarterKeys(state)).toContain("fallingProfitRate");
  });
});

describe("action concept triggers", () => {
  it("detects constant and relative surplus after buying a machine", () => {
    const { prev, next } = actionState("BUY_MACHINE", { cash: 60000 });
    const keys = checkActionDiscoveries({
      prev,
      next,
      actionId: "BUY_MACHINE",
      investmentThisTurn: 18000,
      layoffsThisTurn: 0,
      workersAtTurnStart: 40,
      discovered: {},
    }).map((item) => item.key);
    expect(keys).toEqual(expect.arrayContaining(["constantCapital", "relativeSurplus"]));
  });

  it("detects absolute surplus, accumulation and reserve army at strict thresholds", () => {
    const hours = actionState("EXTEND_HOURS");
    expect(
      checkActionDiscoveries({
        ...hours,
        actionId: "EXTEND_HOURS",
        investmentThisTurn: 0,
        layoffsThisTurn: 0,
        workersAtTurnStart: 40,
        discovered: {},
      }).map((item) => item.key),
    ).toContain("absoluteSurplus");

    const investment = actionState("BUY_MACHINE", {
      cash: 60000,
      last: record({ profit: 30000 }),
    });
    expect(
      checkActionDiscoveries({
        ...investment,
        actionId: "BUY_MACHINE",
        investmentThisTurn: 18000,
        layoffsThisTurn: 0,
        workersAtTurnStart: 40,
        discovered: {},
      }).map((item) => item.key),
    ).toContain("capitalAccumulation");

    const layoffs = actionState("LAYOFF");
    expect(
      checkActionDiscoveries({
        ...layoffs,
        actionId: "LAYOFF",
        investmentThisTurn: 0,
        layoffsThisTurn: 8,
        workersAtTurnStart: 39,
        discovered: {},
      }).map((item) => item.key),
    ).toContain("reserveArmy");
    expect(
      checkActionDiscoveries({
        ...layoffs,
        actionId: "LAYOFF",
        investmentThisTurn: 0,
        layoffsThisTurn: 8,
        workersAtTurnStart: 40,
        discovered: {},
      }).map((item) => item.key),
    ).not.toContain("reserveArmy");
  });
});

import { describe, expect, it } from "vitest";
import { produce } from "immer";
import { checkImmediateDiscoveries, checkQuarterDiscoveries, CONCEPT_KEYS } from "./concepts";
import { DECISIONS } from "./decisions";
import { buyMachine } from "./economy";
import { initialState } from "./state";
import type { GameState, QuarterRecord } from "./types";

function record(overrides: Partial<QuarterRecord> = {}): QuarterRecord {
  return {
    ...initialState(1).last,
    turn: 2,
    output: 900,
    v: 5_000,
    m: 4_000,
    newValue: 9_000,
    accountingProfit: 3_000,
    ...overrides,
  };
}

describe("concept discovery", () => {
  it("buying machinery immediately unlocks c but not relative surplus value", () => {
    const previous = initialState(1);
    const next = produce(previous, (draft) => DECISIONS.BUY_MACHINE.apply(draft));
    const discoveries = checkImmediateDiscoveries({
      prev: previous,
      next,
      cause: "decision",
      workersAtTurnStart: previous.workersActive,
      discovered: {},
    });
    expect(discoveries.map((item) => item.key)).toEqual(["constantCapital"]);
  });

  it("uses the same machinery trigger for an event purchase", () => {
    const previous = initialState(1);
    const next = produce(previous, (draft) => {
      buyMachine(draft, 12_000);
    });
    const discoveries = checkImmediateDiscoveries({
      prev: previous,
      next,
      cause: "event",
      workersAtTurnStart: previous.workersActive,
      discovered: {},
    });
    expect(discoveries.map((item) => item.key)).toContain("constantCapital");
    expect(discoveries[0].action).toContain("sự kiện");
  });

  it("unlocks accumulation only when retained surplus finances half a machine", () => {
    const previous = initialState(1);
    previous.accumulationFund = 12_000;
    const next = produce(previous, (draft) => DECISIONS.BUY_MACHINE.apply(draft));
    const keys = checkImmediateDiscoveries({
      prev: previous,
      next,
      cause: "decision",
      workersAtTurnStart: previous.workersActive,
      discovered: {},
    }).map((item) => item.key);
    expect(keys).toContain("capitalAccumulation");
  });

  it("uses a strict greater-than twenty percent layoff threshold", () => {
    const previous = initialState(1);
    const next = produce(previous, (draft) => DECISIONS.LAYOFF.apply(draft));
    const discoveries = checkImmediateDiscoveries({
      prev: previous,
      next,
      cause: "decision",
      workersAtTurnStart: 32,
      discovered: {},
    });
    expect(discoveries.some((item) => item.key === "reserveArmy")).toBe(true);
  });

  it("limits the first production cycle to H, v and m in that order", () => {
    const state = initialState(1);
    state.history = [
      record({
        turn: 1,
        individualLaborTime: 8,
        socialLaborTime: 6,
        exploitation: 1.2,
        organic: 12,
      }),
    ];
    expect(checkQuarterDiscoveries(state).map((item) => item.key)).toEqual([
      "commodity",
      "variableCapital",
      "surplusValue",
    ]);
  });

  it("unlocks relative surplus only after realised productivity leadership", () => {
    const state = initialState(1);
    state.workHours = 10;
    state.history = [
      record({ turn: 1, machines: 3, organic: 8 }),
      record({
        turn: 2,
        machines: 4,
        machinesAtTurnStart: 3,
        workHoursAtTurnStart: 10,
        laborProductivityAtTurnStart: 0.16,
        laborProductivity: 0.2,
        individualLaborTime: 5,
        socialLaborTime: 6,
        extraProfit: 700,
      }),
    ];
    expect(checkQuarterDiscoveries(state).map((item) => item.key)).toContain("relativeSurplus");
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
    expect(checkQuarterDiscoveries(state).map((item) => item.key)).toContain(
      "overproductionCrisis",
    );
    state.history[0].industrySupply = 3_500;
    expect(checkQuarterDiscoveries(state).map((item) => item.key)).not.toContain(
      "overproductionCrisis",
    );
  });

  it("needs four strict records for three consecutive profit-rate falls", () => {
    const state = initialState(1);
    state.history = [0.4, 0.3, 0.2].map((profitRate, index) =>
      record({ turn: index + 2, profitRate }),
    );
    expect(checkQuarterDiscoveries(state).map((item) => item.key)).not.toContain(
      "fallingProfitRate",
    );
    state.history.push(record({ turn: 5, profitRate: 0.1 }));
    expect(checkQuarterDiscoveries(state).map((item) => item.key)).toContain("fallingProfitRate");
  });

  it("keeps all fifteen codex entries", () => {
    expect(CONCEPT_KEYS).toHaveLength(15);
    expect(new Set(CONCEPT_KEYS).size).toBe(15);
  });

  it("has a scripted evidence path capable of covering all fifteen concepts", () => {
    const found = new Set<string>();
    const collect = (items: ReturnType<typeof checkQuarterDiscoveries>) => {
      for (const item of items) found.add(item.key);
    };

    const actionStart = initialState(1);
    actionStart.accumulationFund = 12_000;
    const actionEnd = produce(actionStart, (draft) => {
      DECISIONS.BUY_MACHINE.apply(draft);
      DECISIONS.EXTEND_HOURS.apply(draft);
      draft.workersActive -= 8;
      draft.workersIdle += 8;
    });
    collect(
      checkImmediateDiscoveries({
        prev: actionStart,
        next: actionEnd,
        cause: "decision",
        workersAtTurnStart: 32,
        discovered: {},
      }),
    );

    const first = initialState(2);
    first.history = [record({ turn: 1 })];
    collect(checkQuarterDiscoveries(first));

    const social = initialState(3);
    social.history = [record({ turn: 2, individualLaborTime: 7, socialLaborTime: 6 })];
    collect(checkQuarterDiscoveries(social));

    const structural = initialState(4);
    structural.contradiction = 80;
    structural.workHours = 10;
    structural.history = [
      record({ turn: 8, organic: 8, machines: 3, profitRate: 0.08 }),
      record({
        turn: 9,
        organic: 11,
        machines: 4,
        machinesAtTurnStart: 3,
        workHoursAtTurnStart: 10,
        laborProductivityAtTurnStart: 0.15,
        laborProductivity: 0.2,
        individualLaborTime: 5,
        socialLaborTime: 6,
        extraProfit: 500,
        exploitation: 1.2,
        inventory: 800,
        demand: 1_000,
        industrySupply: 4_500,
        effectiveDemand: 4_000,
      }),
    ];
    collect(checkQuarterDiscoveries(structural));

    const rates = initialState(5);
    rates.history = [0.12, 0.11, 0.1, 0.09].map((profitRate, index) =>
      record({ turn: 9 + index, profitRate }),
    );
    collect(checkQuarterDiscoveries(rates));

    expect([...found].sort()).toEqual([...CONCEPT_KEYS].sort());
  });
});

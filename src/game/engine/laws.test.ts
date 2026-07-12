import { describe, expect, it } from "vitest";
import { produce } from "immer";
import { DECISIONS } from "../decisions";
import { initialState } from "../state";
import { computeQuarter } from "./laws";

describe("quarterly value and finance laws", () => {
  it("machinery raises productivity without directly creating new value", () => {
    const state = initialState(1);
    const before = computeQuarter(state);
    const mechanized = produce(state, (draft) => DECISIONS.BUY_MACHINE.apply(draft));
    const after = computeQuarter(mechanized);

    expect(after.laborProductivity).toBeGreaterThan(before.laborProductivity);
    expect(after.newValue).toBeCloseTo(before.newValue);
    expect(after.c).toBeGreaterThan(before.c);
  });

  it("a longer working day increases living labour and surplus value", () => {
    const state = initialState(1);
    const before = computeQuarter(state);
    const extended = produce(state, (draft) => DECISIONS.EXTEND_HOURS.apply(draft));
    const after = computeQuarter(extended);

    expect(after.newValue).toBeGreaterThan(before.newValue);
    expect(after.m).toBeGreaterThan(before.m);
  });

  it("does not grant the surplus-rate milestone at the starting balance", () => {
    const state = initialState(1);
    const initial = computeQuarter(state);
    state.workHours = 16;
    const intensified = computeQuarter(state);

    expect(initial.exploitation).toBeLessThan(1);
    expect(intensified.exploitation).toBeGreaterThan(1);
    expect(intensified.m).toBeGreaterThan(initial.m);
  });

  it("charges simple interest at two percent per quarter without capitalising it", () => {
    const state = initialState(1);
    state.debt = 15_000;
    const record = computeQuarter(state);
    expect(record.interestPaid).toBe(300);
    expect(state.debt).toBe(15_000);
  });

  it("retains only the chosen share of positive profit", () => {
    const state = initialState(1);
    state.reinvestmentRate = 0.5;
    const record = computeQuarter(state);
    expect(record.reinvestedProfit + record.ownerConsumption).toBeCloseTo(record.profit);
    expect(record.reinvestedProfit).toBeCloseTo(record.profit * 0.5);
  });
});

import { describe, expect, it } from "vitest";
import { produce } from "immer";
import { BAL } from "../balance";
import { DECISIONS } from "../decisions";
import { advanceQuarter } from "./tick";
import { initialState } from "../state";
import { computeQuarter } from "./laws";

describe("quarterly value and finance laws", () => {
  it("keeps the Marxist value identities explicit", () => {
    const record = computeQuarter(initialState(1));
    expect(record.newValue).toBeCloseTo(record.reproducedVariableCapital + record.m);
    expect(record.unrecoveredVariableCapital).toBe(0);
    expect(record.commodityValue).toBeCloseTo(record.cTransferred + record.newValue);
    expect(record.profitRate).toBeCloseTo(record.m / record.totalCapitalAdvanced);
    expect(record.exploitation).toBeCloseTo(record.m / record.v);
  });

  it("does not turn an unreproduced wage advance into commodity value", () => {
    const state = initialState(1);
    state.wagePerWorker = 1_000;
    const record = computeQuarter(state);

    expect(record.newValue).toBeLessThan(record.v);
    expect(record.m).toBe(0);
    expect(record.reproducedVariableCapital).toBeCloseTo(record.newValue);
    expect(record.unrecoveredVariableCapital).toBeCloseTo(record.v - record.newValue);
    expect(record.commodityValue).toBeCloseTo(record.cTransferred + record.newValue);
    expect(record.commodityValue).toBeLessThan(record.cTransferred + record.v);
  });

  it("machinery raises productivity without directly creating new value", () => {
    const state = initialState(1);
    const before = computeQuarter(state);
    const mechanized = produce(state, (draft) => DECISIONS.BUY_MACHINE.apply(draft));
    const after = computeQuarter(mechanized);

    expect(after.laborProductivity).toBeGreaterThan(before.laborProductivity);
    expect(after.effectiveLaborHours).toBeCloseTo(before.effectiveLaborHours);
    expect(after.newValue).toBeCloseTo(before.newValue);
    expect(after.extraProfit).toBeGreaterThan(before.extraProfit);
    expect(after.constantCapitalAdvanced).toBeGreaterThan(before.constantCapitalAdvanced);
  });

  it("a longer working day raises surplus value while quarterly v stays fixed", () => {
    const state = initialState(1);
    const before = computeQuarter(state);
    const extended = produce(state, (draft) => DECISIONS.EXTEND_HOURS.apply(draft));
    const after = computeQuarter(extended);

    expect(after.v).toBeCloseTo(before.v);
    expect(after.newValue).toBeGreaterThan(before.newValue);
    expect(after.m).toBeGreaterThan(before.m);
  });

  it("a wage rise raises v and lowers the rate of surplus value", () => {
    const state = initialState(1);
    const before = computeQuarter(state);
    const raised = produce(state, (draft) => DECISIONS.RAISE_WAGE.apply(draft));
    const after = computeQuarter(raised);
    expect(after.v).toBeGreaterThan(before.v);
    expect(after.exploitation).toBeLessThan(before.exploitation);
  });

  it("charges simple interest at two percent per quarter without capitalising it", () => {
    const state = initialState(1);
    const record = computeQuarter(state);
    expect(record.interestPaid).toBe(BAL.initialDebt * BAL.quarterlyLoanRate);
    expect(state.debt).toBe(BAL.initialDebt);
  });

  it("separates retained profit, owner consumption and operating cash flow", () => {
    const state = initialState(1);
    state.reinvestmentRate = 0.5;
    const cashBefore = state.cash;
    const bookBefore = state.machineBookValue;
    const record = computeQuarter(state);
    advanceQuarter(state);

    expect(record.retainedProfit + record.ownerConsumption).toBeCloseTo(
      Math.max(0, record.accountingProfit),
    );
    expect(state.cash).toBeCloseTo(cashBefore + record.operatingCashFlow - record.ownerConsumption);
    expect(state.accumulationFund).toBeCloseTo(record.retainedProfit);
    expect(state.machineBookValue).toBeCloseTo(bookBefore - record.depreciation);
  });

  it("makes retention rates change distribution, not current production", () => {
    const records = [0.25, 0.5, 0.75, 1].map((rate) => {
      const state = initialState(1);
      state.reinvestmentRate = rate;
      return computeQuarter(state);
    });
    expect(new Set(records.map((record) => record.m.toFixed(4))).size).toBe(1);
    expect(new Set(records.map((record) => record.cTransferred.toFixed(4))).size).toBe(1);
    expect(records.map((record) => record.retainedProfit)).toEqual(
      [...records.map((record) => record.retainedProfit)].sort((a, b) => a - b),
    );
  });
});

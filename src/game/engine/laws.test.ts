import { produce } from "immer";
import { describe, expect, it } from "vitest";
import { ACTIONS } from "../actions";
import { initialState } from "../state";
import { advanceQuarter } from "./tick";
import { computeQuarter } from "./laws";

describe("Marxian value model", () => {
  it("keeps new value tied to living labour, not machinery", () => {
    const state = initialState(1);
    const before = computeQuarter(state);
    const mechanized = produce(state, (draft) => ACTIONS.BUY_MACHINE.apply(draft));
    const after = computeQuarter(mechanized);

    expect(after.newValue).toBeCloseTo(before.newValue);
    expect(after.output).toBeGreaterThan(before.output);
    expect(after.extraSurplusValue).toBeGreaterThan(before.extraSurplusValue);
    expect(after.m).toBeGreaterThan(before.m);
  });

  it("makes a longer working day raise absolute surplus value", () => {
    const state = initialState(1);
    const before = computeQuarter(state);
    const extended = produce(state, (draft) => ACTIONS.EXTEND_HOURS.apply(draft));
    const after = computeQuarter(extended);

    expect(after.baseSurplusValue).toBeGreaterThan(before.baseSurplusValue);
    expect(after.exploitation).toBeGreaterThan(before.exploitation);
  });

  it("does not force surplus value to collapse during normal operation", () => {
    let state = initialState(1);
    const values: number[] = [];

    for (let turn = 0; turn < 8; turn += 1) {
      state = produce(state, (draft) => {
        advanceQuarter(draft);
        draft.pendingEvent = null;
      });
      values.push(state.last.m);
    }

    expect(Math.min(...values)).toBeGreaterThan(0);
    expect(values.at(-1)).toBeGreaterThan(values[0] * 0.75);
  });
});

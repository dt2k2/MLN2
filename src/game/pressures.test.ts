import { describe, expect, it } from "vitest";
import { initialState } from "./state";
import { readScale } from "./pressures";

describe("historical scale pressures", () => {
  it("reflects inherited debt before the first quarter is completed", () => {
    const indebted = initialState(1);
    const debtFree = { ...indebted, debt: 0 };

    expect(readScale(indebted).capital).toBeGreaterThan(readScale(debtFree).capital);
  });

  it("uses inventory book value when reading debt pressure", () => {
    const state = initialState(1);
    state.debt = 60_000;
    state.inventory = 1_000;
    state.inventoryBookValue = 1_000;
    const lowBookValuePressure = readScale(state).capital;

    state.inventoryBookValue = 40_000;

    expect(readScale(state).capital).toBeLessThan(lowBookValuePressure);
  });
});

import { describe, expect, it } from "vitest";
import { initialState } from "./state";
import { readScale } from "./pressures";

describe("historical scale pressures", () => {
  it("reflects inherited debt before the first quarter is completed", () => {
    const indebted = initialState(1);
    const debtFree = { ...indebted, debt: 0 };

    expect(readScale(indebted).capital).toBeGreaterThan(readScale(debtFree).capital);
  });
});

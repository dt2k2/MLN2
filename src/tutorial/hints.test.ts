import { describe, expect, it } from "vitest";
import { detectHint } from "./hints";
import { initialState } from "@/game/state";

describe("contextual hint detection", () => {
  it("returns null without prev", () => {
    expect(detectHint({ prev: null, next: initialState() })).toBe(null);
  });

  it("fires low-cash when crossing threshold", () => {
    const prev = initialState();
    const next = { ...initialState(), cash: 3000 };
    expect(detectHint({ prev, next })).toBe("low-cash");
  });

  it("fires bought-machine when machines increase", () => {
    const prev = initialState();
    const next = { ...initialState(), machines: prev.machines + 1 };
    expect(detectHint({ prev, next })).toBe("bought-machine");
  });

  it("fires first-borrow when debt jumps", () => {
    const prev = initialState();
    const next = { ...initialState(), debt: prev.debt + 15000 };
    expect(detectHint({ prev, next })).toBe("first-borrow");
  });
});

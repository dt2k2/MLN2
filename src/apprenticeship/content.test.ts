import { describe, expect, it } from "vitest";
import { ADVANCED_LOCKED_COUNT, ROUNDS } from "./content";

describe("apprenticeship concepts", () => {
  it("teaches exactly ten unique concepts and leaves five locked", () => {
    const learned = Object.values(ROUNDS).flatMap((round) => round.concepts.map((c) => c.id));
    expect(learned).toHaveLength(10);
    expect(new Set(learned).size).toBe(10);
    expect(learned).toContain("surplusValue");
    expect(learned).not.toContain("livingLabor");
    expect(learned.length + ADVANCED_LOCKED_COUNT).toBe(15);
  });
});

import { describe, expect, it } from "vitest";
import { AMBIENCE_BY_CONDITION } from "./ambience-profile";

describe("hero ambience profile", () => {
  it("uses machinery for ordinary and production-pressure conditions", () => {
    expect(AMBIENCE_BY_CONDITION.neutral).toBe("factory-steady");
    expect(AMBIENCE_BY_CONDITION.expansion).toBe("factory-steady");
    expect(AMBIENCE_BY_CONDITION.dominant).toBe("factory-steady");
    expect(AMBIENCE_BY_CONDITION.hardline).toBe("factory-strained");
    expect(AMBIENCE_BY_CONDITION["market-crisis"]).toBe("factory-strained");
  });

  it("reserves crowd ambience for open labor conflict", () => {
    expect(AMBIENCE_BY_CONDITION["labor-conflict"]).toBe("crowd-distant");
    expect(AMBIENCE_BY_CONDITION.rupture).toBe("crowd-distant");
  });
});

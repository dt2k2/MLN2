import { describe, expect, it } from "vitest";
import { phaseToStep } from "./components/PhaseIndicator";
import type { Phase } from "./types";

describe("PhaseIndicator mapping", () => {
  it("maps brief, interact, simulate → step 1 (Thử nghiệm)", () => {
    expect(phaseToStep("brief")).toBe(1);
    expect(phaseToStep("interact")).toBe(1);
    expect(phaseToStep("simulate")).toBe(1);
  });

  it("maps eureka → step 2 (Giải thích)", () => {
    expect(phaseToStep("eureka")).toBe(2);
  });

  it("maps check → step 3 (Kiểm tra)", () => {
    expect(phaseToStep("check")).toBe(3);
  });

  it("maps complete → step 3 (fallthrough)", () => {
    expect(phaseToStep("complete")).toBe(3);
  });
});

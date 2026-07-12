import { describe, expect, it } from "vitest";
import { deriveHeinrichPresentation, deriveHeroCondition, getRecentOwnerSignals } from "./heinrich";
import { initialState } from "./state";
import type { GameState, OwnerStance } from "./types";

function stateWith(change: (state: GameState) => void) {
  const state = initialState(1852);
  change(state);
  return state;
}

function signal(state: GameState, stance: OwnerStance, source = "test") {
  state.ownerSignals = [{ turn: state.turn, stance, source }];
}

describe("Heinrich presentation", () => {
  it("derives all seven objective conditions", () => {
    expect(deriveHeroCondition(initialState(1))).toBe("neutral");
    expect(
      deriveHeroCondition(
        stateWith((state) => {
          signal(state, "expansionist");
          state.machines = state.machinesAtTurnStart + 1;
          state.last.accountingProfit = 1_000;
        }),
      ),
    ).toBe("expansion");
    expect(
      deriveHeroCondition(
        stateWith((state) => {
          signal(state, "coercive");
          state.workHours = 12;
        }),
      ),
    ).toBe("hardline");
    expect(
      deriveHeroCondition(
        stateWith((state) => {
          state.overstockStreak = 2;
        }),
      ),
    ).toBe("market-crisis");
    expect(
      deriveHeroCondition(
        stateWith((state) => {
          state.unrest = 70;
        }),
      ),
    ).toBe("labor-conflict");
    expect(
      deriveHeroCondition(
        stateWith((state) => {
          state.contradiction = 85;
        }),
      ),
    ).toBe("rupture");
    expect(
      deriveHeroCondition(
        stateWith((state) => {
          state.marketShare = 0.5;
          state.last.accountingProfit = 1_000;
          state.last.profitRateReal = 0.09;
        }),
      ),
    ).toBe("dominant");
  });

  it("keeps danger conditions ahead of commercial success", () => {
    const state = stateWith((current) => {
      current.contradiction = 85;
      current.unrest = 90;
      current.overstockStreak = 3;
      current.marketShare = 0.7;
      current.last.accountingProfit = 5_000;
      current.last.profitRateReal = 0.2;
    });
    expect(deriveHeroCondition(state)).toBe("rupture");
  });

  it("expires owner signals after four quarters and keeps at most four", () => {
    const state = stateWith((current) => {
      current.turn = 8;
      current.ownerSignals = [
        { turn: 2, stance: "coercive", source: "old" },
        { turn: 4, stance: "reformist", source: "edge" },
        { turn: 5, stance: "pragmatic", source: "a" },
        { turn: 6, stance: "speculative", source: "b" },
        { turn: 7, stance: "expansionist", source: "c" },
        { turn: 8, stance: "coercive", source: "d" },
      ];
    });
    expect(getRecentOwnerSignals(state).map((item) => item.source)).toEqual(["a", "b", "c", "d"]);
  });

  it("does not turn borrowed cash alone into expansion or dominance", () => {
    const state = stateWith((current) => {
      current.cash += 15_000;
      current.debt += 15_000;
      signal(current, "speculative", "decision:BORROW");
    });
    expect(deriveHeroCondition(state)).toBe("neutral");
    expect(deriveHeinrichPresentation(state).stance).toBe("speculative");
  });

  it("changes labor-conflict monologue with the owner's stance", () => {
    const reformist = stateWith((state) => {
      state.unrest = 72;
      signal(state, "reformist", "event:factory-strike:0");
    });
    const coercive = stateWith((state) => {
      state.unrest = 72;
      signal(state, "coercive", "event:factory-strike:1");
    });

    expect(deriveHeinrichPresentation(reformist).condition).toBe("labor-conflict");
    expect(deriveHeinrichPresentation(coercive).condition).toBe("labor-conflict");
    expect(deriveHeinrichPresentation(reformist).monologue).not.toBe(
      deriveHeinrichPresentation(coercive).monologue,
    );
  });

  it("selects the same monologue for the same state", () => {
    const state = stateWith((current) => {
      current.overstockStreak = 2;
      signal(current, "expansionist");
    });
    expect(deriveHeinrichPresentation(state)).toEqual(deriveHeinrichPresentation(state));
  });
});

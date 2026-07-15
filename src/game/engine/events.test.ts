import { describe, expect, it } from "vitest";
import { BAL } from "../balance";
import { initialState } from "../state";
import { EVENTS, eligibleEvents, getGamePhase } from "./events";

describe("event engine", () => {
  it("contains the fourteen phased events", () => {
    expect(EVENTS).toHaveLength(14);
  });

  it("maps the 24 turns into four six-turn phases", () => {
    expect([1, 6, 7, 12, 13, 18, 19, 24].map(getGamePhase)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("never offers the credit crisis without debt", () => {
    const state = initialState(1);
    state.turn = 19;
    state.year = 1857;
    state.debt = 0;
    expect(eligibleEvents(state).some((event) => event.id === "credit-crisis-1857")).toBe(false);
    state.debt = 15_000;
    expect(eligibleEvents(state).some((event) => event.id === "credit-crisis-1857")).toBe(true);
  });

  it("does not date the 1857 credit crisis in the 1856 part of phase four", () => {
    const state = initialState(1);
    state.turn = 19;
    state.year = 1856;
    state.debt = 15_000;
    expect(eligibleEvents(state).some((event) => event.id === "credit-crisis-1857")).toBe(false);

    state.turn = 21;
    state.year = 1857;
    expect(eligibleEvents(state).some((event) => event.id === "credit-crisis-1857")).toBe(true);
  });

  it("demands no more principal than is outstanding", () => {
    const definition = EVENTS.find((event) => event.id === "credit-crisis-1857");
    const state = initialState(1);
    state.turn = 19;
    state.year = 1857;
    state.debt = 3_000;
    state.cash = 0;
    const occurrence = definition!.build(state);
    occurrence.choices[0].apply(state);
    expect(state.debt).toBe(0);
    expect(state.cash).toBe(9_000);
  });

  it("keeps penalty interest active for exactly two computed quarters", () => {
    const definition = EVENTS.find((event) => event.id === "credit-crisis-1857");
    const state = initialState(1);
    state.turn = 19;
    state.year = 1857;
    state.debt = 15_000;
    const occurrence = definition!.build(state);
    occurrence.choices[1].apply(state);
    expect(state.activeEffects[0]).toMatchObject({
      kind: "interestRateMultiplier",
      value: 2,
      remainingTurns: 2,
    });
  });

  it("respects unique history and every eligible event has a valid choice", () => {
    for (const turn of [1, 7, 13, 19]) {
      const state = initialState(turn);
      state.turn = turn;
      state.debt = BAL.loanUnit;
      state.unrest = 80;
      state.inventory = 1_000;
      state.demand = 1_000;
      state.industrySupply = 5_000;
      state.effectiveDemand = 4_000;
      for (const event of eligibleEvents(state)) {
        const occurrence = event.build(state);
        expect(
          occurrence.choices.some((choice) => !choice.canChoose || choice.canChoose(state)),
        ).toBe(true);
      }
    }

    const state = initialState(1);
    state.eventHistory["defective-cloth"] = { count: 1, lastTurn: 1 };
    expect(eligibleEvents(state).some((event) => event.id === "defective-cloth")).toBe(false);
  });

  it("treats accepting Krupp's offer as a takeover rather than a monopoly victory", () => {
    const definition = EVENTS.find((event) => event.id === "krupp-merger");
    const state = initialState(1);
    state.turn = 19;
    state.marketShare = 0.2;

    definition!.build(state).choices[0].apply(state);

    expect(state.ending).toBe("merger");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { BAL } from "./balance";
import { initialState, MAX_ACTIONS_PER_TURN, useGameStore } from "./state";

function dismissAll() {
  while (useGameStore.getState().presentationQueue.length > 0) {
    useGameStore.getState().dismissPresentation();
  }
}

describe("game store rules", () => {
  beforeEach(() => useGameStore.getState().reset());

  it("allows at most three distinct actions per quarter", () => {
    useGameStore.getState().applyAction("RAISE_WAGE");
    useGameStore.getState().applyAction("BORROW");
    useGameStore.getState().applyAction("LAYOFF");
    useGameStore.getState().applyAction("EXTEND_HOURS");

    const store = useGameStore.getState();
    expect(store.usedActions.size).toBe(MAX_ACTIONS_PER_TURN);
    expect(store.usedActions.has("EXTEND_HOURS")).toBe(false);
  });

  it("requires cash for investment and prevents borrowing beyond the cap", () => {
    useGameStore.setState({
      state: { ...initialState(1), cash: BAL.machinePrice - 1 },
    });
    useGameStore.getState().applyAction("BUY_MACHINE");
    expect(useGameStore.getState().state.machines).toBe(3);

    useGameStore.setState({
      state: { ...initialState(1), debt: BAL.maxDebt - BAL.loanUnit + 1 },
      usedActions: new Set(),
    });
    useGameStore.getState().applyAction("BORROW");
    expect(useGameStore.getState().state.debt).toBe(BAL.maxDebt - BAL.loanUnit + 1);
  });

  it("queues eurekas before achievements and the quarter presentation", () => {
    useGameStore.getState().endQuarter();
    const queue = useGameStore.getState().presentationQueue;
    const firstAchievement = queue.findIndex((item) => item.kind === "achievement");
    const period = queue.findIndex((item) => item.kind === "summary" || item.kind === "eraRecap");
    const lastEureka = queue.map((item) => item.kind).lastIndexOf("eureka");

    expect(lastEureka).toBeGreaterThanOrEqual(0);
    expect(period).toBe(queue.length - 1);
    if (firstAchievement >= 0) expect(firstAchievement).toBeGreaterThan(lastEureka);
  });

  it("uses an era recap on every sixth completed turn", () => {
    useGameStore.setState({
      state: { ...initialState(1), turn: 6 },
      usedActions: new Set(),
      presentationQueue: [],
    });
    useGameStore.getState().endQuarter();
    expect(useGameStore.getState().presentationQueue.at(-1)?.kind).toBe("eraRecap");
  });

  it("resets turn counters and all educational progress", () => {
    useGameStore.getState().applyAction("EXTEND_HOURS");
    dismissAll();
    useGameStore.getState().reset();
    const store = useGameStore.getState();
    expect(store.usedActions.size).toBe(0);
    expect(store.investmentThisTurn).toBe(0);
    expect(store.layoffsThisTurn).toBe(0);
    expect(store.presentationQueue).toHaveLength(0);
    expect(store.state.discoveredConcepts).toEqual({});
    expect(store.state.achievements).toEqual({});
  });
});

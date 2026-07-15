import { beforeEach, describe, expect, it } from "vitest";
import { BAL } from "./balance";
import { MAX_DECISION_GROUPS_PER_TURN, initialState, useGameStore } from "./state";

function ready() {
  useGameStore.getState().reset();
  while (useGameStore.getState().presentationQueue.length) {
    useGameStore.getState().dismissPresentation();
  }
}

describe("decision store", () => {
  beforeEach(ready);

  it("starts from the inherited workshop described by the prologue", () => {
    const state = initialState();
    expect(state.seed).toBe(BAL.initialSeed);
    expect(state.cash).toBe(BAL.initialCash);
    expect(state.debt).toBe(BAL.initialDebt);
    expect(state.machines).toBe(BAL.initialMachines);
    expect(state.workersActive).toBe(BAL.initialActiveWorkers);
    expect(state.workersIdle).toBe(BAL.initialIdleWorkers);
  });

  it("allows at most three different groups per quarter", () => {
    useGameStore.getState().applyDecision("RAISE_WAGE");
    useGameStore.getState().applyDecision("BORROW");
    useGameStore.getState().applyDecision("LAYOFF");
    useGameStore.getState().applyDecision("EXTEND_HOURS");

    const store = useGameStore.getState();
    expect(store.usedDecisionGroups.size).toBe(MAX_DECISION_GROUPS_PER_TURN);
    expect(store.usedDecisionGroups.has("WORKDAY")).toBe(false);
  });

  it("uses each group only once even when it has several options", () => {
    const before = useGameStore.getState().state.workHours;
    useGameStore.getState().applyDecision("EXTEND_HOURS");
    while (useGameStore.getState().presentationQueue.length) {
      useGameStore.getState().dismissPresentation();
    }
    useGameStore.getState().applyDecision("REDUCE_HOURS");
    expect(useGameStore.getState().state.workHours).toBe(before + 2);
  });

  it("does not spend a decision on the retention rate already in force", () => {
    useGameStore.getState().applyDecision("REINVEST_25");
    expect(useGameStore.getState().usedDecisionGroups.size).toBe(0);
    useGameStore.getState().applyDecision("REINVEST_50");
    expect(useGameStore.getState().usedDecisionGroups.has("ACCUMULATION")).toBe(true);
    expect(useGameStore.getState().state.reinvestmentRate).toBe(0.5);
  });

  it("blocks active investment without cash and requires credit in another group", () => {
    useGameStore.setState({ state: { ...initialState(2), cash: 0 } });
    useGameStore.getState().applyDecision("BUY_MACHINE");
    expect(useGameStore.getState().state.machines).toBe(3);
    useGameStore.getState().applyDecision("BORROW");
    expect(useGameStore.getState().state.cash).toBe(BAL.loanUnit);
    expect(useGameStore.getState().state.debt).toBe(BAL.initialDebt + BAL.loanUnit);
  });

  it("never makes a fixed repayment smaller than the amount on its label", () => {
    useGameStore.setState({
      state: { ...initialState(2), cash: 10_000, debt: 3_000 },
    });

    useGameStore.getState().applyDecision("REPAY_5000");
    expect(useGameStore.getState().state.debt).toBe(3_000);
    expect(useGameStore.getState().usedDecisionGroups.size).toBe(0);

    useGameStore.getState().applyDecision("REPAY_ALL");
    expect(useGameStore.getState().state.debt).toBe(0);
    expect(useGameStore.getState().state.cash).toBe(7_000);
  });

  it("never borrows over the ceiling or repays over debt/cash", () => {
    useGameStore.setState({
      state: { ...initialState(3), debt: BAL.maxDebt, cash: 1_000 },
    });
    useGameStore.getState().applyDecision("BORROW");
    expect(useGameStore.getState().state.debt).toBe(BAL.maxDebt);
    useGameStore.getState().applyDecision("REPAY_5000");
    expect(useGameStore.getState().state.debt).toBe(BAL.maxDebt);
  });

  it("resets group limits and all transient game history", () => {
    useGameStore.getState().applyDecision("LAYOFF");
    expect(useGameStore.getState().state.decisionHistory).toHaveLength(1);
    useGameStore.getState().reset();
    const store = useGameStore.getState();
    expect(store.usedDecisionGroups.size).toBe(0);
    expect(store.state.eventHistory).toEqual({});
    expect(store.state.activeEffects).toEqual([]);
    expect(store.state.accumulationFund).toBe(0);
    expect(store.state.decisionHistory).toEqual([]);
    expect(store.state.machineBookValue).toBe(BAL.machinePrice * BAL.initialMachines);
    expect(store.state.debt).toBe(BAL.initialDebt);
    expect(store.state.turn).toBe(1);
  });

  it("records successful decisions with their historical context", () => {
    useGameStore.getState().applyDecision("RAISE_WAGE");

    expect(useGameStore.getState().state.decisionHistory).toEqual([
      expect.objectContaining({
        turn: 1,
        year: BAL.startYear,
        quarter: 1,
        source: "decision",
        id: "RAISE_WAGE",
        groupId: "WAGES",
        ownerStance: "reformist",
      }),
    ]);
  });

  it("presents only the three-step first production series without auto-accumulation", () => {
    useGameStore.getState().endQuarter();
    const store = useGameStore.getState();
    const eureka = store.presentationQueue.filter((item) => item.kind === "eureka");
    expect(eureka.map((item) => item.conceptKey)).toEqual([
      "commodity",
      "variableCapital",
      "surplusValue",
    ]);
    expect(eureka.map((item) => item.series?.step)).toEqual([1, 2, 3]);
    expect(store.state.discoveredConcepts.capitalAccumulation).toBeUndefined();
  });

  it("checks event consequences immediately and presents deferred story before ending", () => {
    const state = initialState(4);
    state.cash = -14_000;
    state.pendingEvent = {
      id: "test-event",
      title: "Chi phí bất ngờ",
      description: "Một khoản chi bắt buộc.",
      choices: [
        {
          label: "Thanh toán",
          tone: "accept",
          previewLabel: "−$2.000",
          apply: (draft) => {
            draft.cash -= 2_000;
          },
        },
      ],
    };
    useGameStore.setState({
      state,
      presentationQueue: [
        { id: "event-test", kind: "event", eventId: "test-event" },
        {
          id: "test-story",
          kind: "story",
          story: {
            id: "test-story",
            kind: "beat",
            eyebrow: "Gazette",
            title: "Sau sự kiện",
            body: "Câu chuyện phải được xem trước ending.",
          },
        },
      ],
    });

    useGameStore.getState().resolveEvent(0);
    const store = useGameStore.getState();
    expect(store.state.ending).toBe("bankruptcy");
    expect(store.presentationQueue[0]).toMatchObject({
      kind: "story",
      id: "test-story",
    });
  });
});

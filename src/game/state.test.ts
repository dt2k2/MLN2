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

  it("blocks active investment without cash and requires credit in another group", () => {
    useGameStore.setState({ state: { ...initialState(2), cash: 0 } });
    useGameStore.getState().applyDecision("BUY_MACHINE");
    expect(useGameStore.getState().state.machines).toBe(3);
    useGameStore.getState().applyDecision("BORROW");
    expect(useGameStore.getState().state.cash).toBe(BAL.loanUnit);
    expect(useGameStore.getState().state.debt).toBe(BAL.loanUnit);
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
    useGameStore.getState().reset();
    const store = useGameStore.getState();
    expect(store.usedDecisionGroups.size).toBe(0);
    expect(store.state.eventHistory).toEqual({});
    expect(store.state.activeEffects).toEqual([]);
    expect(store.state.turn).toBe(1);
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

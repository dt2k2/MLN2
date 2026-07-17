import { describe, expect, it } from "vitest";
import { initialState, reducer } from "./state";

describe("apprenticeship reducer", () => {
  it("khởi đầu ở round 1 phase brief", () => {
    const s = initialState();
    expect(s.currentRound).toBe(1);
    expect(s.phase).toBe("brief");
    expect(s.unlockedUpTo).toBe(1);
  });

  it("WRONG_ANSWER tăng attempts nhưng không đổi unlockedUpTo", () => {
    let s = initialState();
    s = reducer(s, { type: "WRONG_ANSWER" });
    expect(s.rounds[1].attempts).toBe(1);
    expect(s.unlockedUpTo).toBe(1);
    expect(s.rounds[1].completed).toBe(false);
  });

  it("RESET_ROUND đưa phase về brief", () => {
    let s = initialState();
    s = reducer(s, { type: "SET_PHASE", phase: "check" });
    s = reducer(s, { type: "RESET_ROUND" });
    expect(s.phase).toBe("brief");
  });

  it("COMPLETE_ROUND mở round tiếp theo", () => {
    let s = initialState();
    s = reducer(s, { type: "COMPLETE_ROUND" });
    expect(s.rounds[1].completed).toBe(true);
    expect(s.currentRound).toBe(2);
    expect(s.unlockedUpTo).toBe(2);
    expect(s.phase).toBe("brief");
  });

  it("GOTO_ROUND chặn nếu chưa unlock (không có dev)", () => {
    let s = initialState();
    s = reducer(s, { type: "GOTO_ROUND", round: 4 });
    expect(s.currentRound).toBe(1);
    s = reducer(s, { type: "GOTO_ROUND", round: 4, dev: true });
    expect(s.currentRound).toBe(4);
  });

  it("COMPLETE_ROUND cuối cùng đặt phase complete", () => {
    let s = initialState();
    s = { ...s, currentRound: 6, unlockedUpTo: 6 };
    s = reducer(s, { type: "COMPLETE_ROUND" });
    expect(s.phase).toBe("complete");
    expect(s.rounds[6].completed).toBe(true);
  });
});

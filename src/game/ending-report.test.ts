import { afterEach, describe, expect, it, vi } from "vitest";
import { BAL } from "./balance";
import {
  buildEndingReport,
  clearEndingReportSnapshot,
  loadEndingReportSnapshot,
  saveEndingReportSnapshot,
} from "./ending-report";
import { initialState } from "./state";

describe("ending historical report", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("describes bankruptcy from actual liquidity evidence", () => {
    const state = initialState(1);
    state.cash = BAL.bankruptcyCashFloor - 500;

    const report = buildEndingReport(state, "bankruptcy");

    expect(report.thesis).toContain("thanh khoản");
    expect(report.thesis).toContain("−$15.500");
    expect(report.thesis).not.toContain("cơ giới hóa");
  });

  it("distinguishes acquisition from a monopoly victory", () => {
    const state = initialState(1);
    state.decisionHistory.push({
      turn: 19,
      year: 1856,
      quarter: 3,
      source: "event",
      id: "krupp-merger:0",
      label: "Chấp nhận sáp nhập",
      ownerStance: "speculative",
    });

    const report = buildEndingReport(state, "merger");

    expect(report.thesis).toContain("chuyển quyền kiểm soát");
    expect(report.thesis).toContain("không phải chiến thắng độc quyền");
    expect(report.causalChain.at(-1)).toBe("Chuyển quyền kiểm soát");
  });

  it("uses recorded choices as pivots without claiming single-cause morality", () => {
    const state = initialState(1);
    state.ending = "revolution";
    state.decisionHistory.push({
      turn: 1,
      year: BAL.startYear,
      quarter: 1,
      source: "decision",
      id: "EXTEND_HOURS",
      label: "Tăng 2 giờ",
      groupId: "WORKDAY",
      ownerStance: "coercive",
    });

    const report = buildEndingReport(state, "revolution");

    expect(report.pivots.some((pivot) => pivot.title.includes("Tăng 2 giờ"))).toBe(true);
    expect(report.qualification).toContain("không quy một hiện tượng cấu trúc");
  });

  it("does not invent an ending cause after direct navigation loses the game state", () => {
    const state = initialState(1);

    const revolution = buildEndingReport(state, "revolution");
    const bankruptcy = buildEndingReport(state, "bankruptcy");
    expect(revolution.thesis).toContain("không còn trong bộ nhớ");
    expect(revolution.metrics).toEqual([]);
    expect(bankruptcy.thesis).toContain("không còn trong bộ nhớ");
    expect(bankruptcy.metrics).toEqual([]);
  });

  it("never replaces recorded decisions with supplemental structural pivots", () => {
    const state = initialState(1);
    state.ending = "bankruptcy";
    const ids = ["BUY_MACHINE", "BORROW", "LAYOFF", "EXTEND_HOURS", "REINVEST_100"] as const;
    state.decisionHistory = ids.map((id, index) => ({
      turn: index + 1,
      year: BAL.startYear,
      quarter: index + 1,
      source: "decision" as const,
      id,
      label: id,
    }));

    const report = buildEndingReport(state, "bankruptcy");

    expect(report.pivots).toHaveLength(5);
    expect(new Set(report.pivots.map((pivot) => pivot.id))).toEqual(new Set(ids));
  });

  it("keeps only the matching ending snapshot for the current browser session", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
    const state = initialState(1);
    state.ending = "merger";

    saveEndingReportSnapshot(state, "merger");

    expect(loadEndingReportSnapshot("merger")?.available).toBe(true);
    expect(loadEndingReportSnapshot("timeout")).toBeNull();
    clearEndingReportSnapshot();
    expect(loadEndingReportSnapshot("merger")).toBeNull();
  });
});

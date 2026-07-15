import { describe, expect, it } from "vitest";
import { collectStories, quarterNews } from "./story";
import { BAL } from "./balance";
import { initialState } from "./state";

describe("narrative", () => {
  it("opens chapters only at the four timeline boundaries", () => {
    const titles = [1, 7, 13, 19].map((turn) => {
      const state = initialState(turn);
      state.turn = turn;
      return collectStories(state).find((story) => story.kind === "chapter")?.title;
    });
    expect(titles.every(Boolean)).toBe(true);

    const state = initialState(2);
    state.turn = 2;
    expect(collectStories(state).some((story) => story.kind === "chapter")).toBe(false);
  });

  it("carries the inherited debt and workshop figures into chapter one", () => {
    const chapter = collectStories(initialState(1)).find((story) => story.id === "chapter-1");
    expect(chapter?.body).toContain(BAL.initialDebt.toLocaleString("vi-VN"));
    expect(chapter?.body).toContain(String(BAL.initialMachines));
    expect(chapter?.body).toContain(String(BAL.initialActiveWorkers));
    expect(chapter?.body).toContain(
      (BAL.initialDebt * BAL.quarterlyLoanRate).toLocaleString("vi-VN"),
    );
  });

  it("uses actual state values in conditional beats and suppresses seen stories", () => {
    const state = initialState(1);
    state.workersIdle = 16;
    const story = collectStories(state).find((item) => item.id === "beat-reserve-army");
    expect(story?.body).toContain("16");
    state.seenStoryIds["beat-reserve-army"] = true;
    expect(collectStories(state).some((item) => item.id === "beat-reserve-army")).toBe(false);
  });

  it("writes one data-driven Gazette line for the completed quarter", () => {
    const state = initialState(1);
    state.last.accountingProfit = -1_234;
    expect(quarterNews(state)).toContain("1,234");
  });
});

import { useEffect, useMemo, useState } from "react";
import { buildEndingReport, loadEndingReportSnapshot, type EndingReport } from "./ending-report";
import type { EndingId, GameState } from "./types";

export function useEndingReport(state: GameState, ending: EndingId): EndingReport {
  const liveReport = useMemo(() => buildEndingReport(state, ending), [state, ending]);
  const [report, setReport] = useState(liveReport);

  useEffect(() => {
    setReport(liveReport.available ? liveReport : (loadEndingReportSnapshot(ending) ?? liveReport));
  }, [ending, liveReport]);

  return report;
}

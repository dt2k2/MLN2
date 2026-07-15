import { BAL } from "./balance";
import type {
  DecisionHistoryEntry,
  DecisionOptionId,
  EndingId,
  GameState,
  QuarterRecord,
} from "./types";

export interface EndingMetric {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "positive" | "warning";
}

export interface EndingPivot {
  id: string;
  turn: number;
  period: string;
  title: string;
  mechanism: string;
  evidence: string;
}

export interface EndingReport {
  thesis: string;
  qualification: string;
  metrics: EndingMetric[];
  pivots: EndingPivot[];
  causalChain: string[];
  counterfactuals: string[];
}

const money = (value: number) =>
  `${value < 0 ? "−" : ""}$${Math.abs(Math.round(value)).toLocaleString("vi-VN")}`;
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const period = (turn: number) =>
  `Q${((turn - 1) % 4) + 1}/${BAL.startYear + Math.floor((turn - 1) / 4)}`;

const DECISION_MECHANISMS: Partial<Record<DecisionOptionId, string>> = {
  EXTEND_HOURS:
    "Ngày lao động dài hơn làm tăng lao động sống trong khi quỹ lương quý chưa tự động tăng.",
  REDUCE_HOURS:
    "Ngày lao động ngắn hơn hạn chế lao động thặng dư trực tiếp và tạo điều kiện phục hồi sức khỏe.",
  RAISE_WAGE:
    "Tiền lương cao hơn làm tăng tư bản khả biến, hỗ trợ sức mua nhưng thu hẹp m′ nếu các điều kiện khác giữ nguyên.",
  CUT_WAGE:
    "Tiền lương thấp hơn giảm chi phí của xưởng nhưng làm sức mua và khả năng tái sản xuất sức lao động suy yếu.",
  HIRE_WORKERS: "Tuyển dụng mở rộng lao động sống và thu hẹp một phần đội quân lao động dự bị.",
  LAYOFF:
    "Sa thải giảm quỹ lương của xưởng nhưng mở rộng đội quân lao động dự bị và sức ép xã hội.",
  BUY_MACHINE:
    "Máy mới tăng năng suất và tư bản bất biến; nó chuyển giá trị cũ chứ không tự tạo giá trị mới.",
  SELL_MACHINE:
    "Thanh lý máy đổi năng lực sản xuất lấy tiền mặt và làm giảm giá trị tư bản cố định đang ứng trước.",
  REINVEST_25:
    "Một phần lợi nhuận được giữ ở hình thái tiền tệ để chuẩn bị cho chu kỳ tích lũy sau.",
  REINVEST_50:
    "Một nửa lợi nhuận được giữ ở hình thái tiền tệ để chuẩn bị cho chu kỳ tích lũy sau.",
  REINVEST_75:
    "Phần lớn lợi nhuận được giữ lại, giảm tiêu dùng của chủ sở hữu để ưu tiên tích lũy.",
  REINVEST_100: "Toàn bộ lợi nhuận dương được giữ lại, ưu tiên tối đa cho tích lũy tư bản.",
  BORROW:
    "Tín dụng mở rộng khả năng chi tiêu hiện tại nhưng chuyển một phần giá trị tương lai thành nghĩa vụ lãi.",
  REPAY_5000: "Trả nợ làm giảm tiền mặt hiện tại để hạ nghĩa vụ lãi của các quý sau.",
  REPAY_15000: "Trả nợ làm giảm tiền mặt hiện tại để hạ nghĩa vụ lãi của các quý sau.",
  REPAY_ALL:
    "Tất toán xóa nghĩa vụ lãi nhưng cũng rút một lượng tiền mặt khỏi lưu thông của xưởng.",
};

function recordForDecision(state: GameState, entry: DecisionHistoryEntry) {
  return state.history.find((record) => record.turn === entry.turn);
}

function evidenceFor(
  entry: DecisionHistoryEntry,
  record: QuarterRecord | undefined,
  state: GameState,
) {
  if (!record) {
    return `Sau lựa chọn này, xưởng kết thúc với tiền mặt ${money(state.cash)}, dư nợ ${money(state.debt)} và mâu thuẫn ${Math.round(state.contradiction)}/100.`;
  }

  const id = entry.id as DecisionOptionId;
  if (id === "BUY_MACHINE" || id === "SELL_MACHINE") {
    return `Cuối quý: ${record.machines} máy, năng suất ${record.laborProductivity.toFixed(3)} đvsp/giờ và c/v ${record.organic.toFixed(2)}.`;
  }
  if (id.startsWith("REINVEST_")) {
    return `Cuối quý: lợi nhuận ${money(record.accountingProfit)}, giữ lại ${money(record.retainedProfit)} và chủ sở hữu rút ${money(record.ownerConsumption)}.`;
  }
  if (id === "BORROW" || id.startsWith("REPAY_")) {
    return `Cuối quý: trả lãi ${money(record.interestPaid)}, tỷ lệ nợ/tài sản ${(record.debtRatio * 100).toFixed(1)}% và dòng tiền ${money(record.operatingCashFlow)}.`;
  }
  if (entry.groupId === "WORKDAY" || entry.groupId === "WAGES") {
    return `Cuối quý: m′ ${percent(record.exploitation)}, m ${money(record.m)}, sức khỏe ${Math.round(record.health)} và bất ổn ${Math.round(record.unrest)}.`;
  }
  if (entry.groupId === "STAFFING") {
    return `Cuối quý: quỹ lương ${money(record.v)}, m ${money(record.m)} và bất ổn ${Math.round(record.unrest)}/100.`;
  }
  return `Sau giai đoạn này: lợi nhuận ${money(record.accountingProfit)}, tồn kho ${Math.round(record.inventory).toLocaleString("vi-VN")} và mâu thuẫn ${Math.round(record.contradiction)}/100.`;
}

function decisionScore(entry: DecisionHistoryEntry, ending: EndingId, count: number) {
  let score = entry.source === "event" ? 3 : 1;
  const id = entry.id as DecisionOptionId;
  const coercive = ["EXTEND_HOURS", "CUT_WAGE", "LAYOFF"].includes(id);
  const reformist = ["REDUCE_HOURS", "RAISE_WAGE", "HIRE_WORKERS"].includes(id);
  const financial = ["BUY_MACHINE", "BORROW", "REINVEST_75", "REINVEST_100"].includes(id);

  if (ending === "revolution" && coercive) score += 6;
  if (ending === "bankruptcy" && financial) score += 6;
  if (ending === "reform" && reformist) score += 6;
  if (ending === "monopoly" && (id === "BUY_MACHINE" || financial)) score += 5;
  if (ending === "merger" && entry.id.startsWith("krupp-merger")) score += 10;
  if (id === "BUY_MACHINE" || id === "BORROW" || id === "LAYOFF") score += 2;
  return score + Math.min(3, count - 1) * 0.75;
}

function decisionPivots(state: GameState, ending: EndingId): EndingPivot[] {
  const grouped = new Map<string, DecisionHistoryEntry[]>();
  for (const entry of state.decisionHistory) {
    const entries = grouped.get(entry.id) ?? [];
    entries.push(entry);
    grouped.set(entry.id, entries);
  }

  return [...grouped.values()]
    .map((entries) => {
      const entry = entries.at(-1)!;
      const record = recordForDecision(state, entry);
      const mechanism =
        entry.source === "event"
          ? "Một cú sốc lịch sử đã thay đổi điều kiện vận động của xưởng; kết quả không thể quy hoàn toàn về ý chí cá nhân."
          : (DECISION_MECHANISMS[entry.id as DecisionOptionId] ??
            "Quyết định này làm thay đổi cách xưởng phân bổ lao động, tư bản hoặc rủi ro.");
      return {
        score: decisionScore(entry, ending, entries.length),
        pivot: {
          id: entry.id,
          turn: entry.turn,
          period: period(entry.turn),
          title: `${entry.label}${entries.length > 1 ? ` · ${entries.length} lần` : ""}`,
          mechanism,
          evidence: evidenceFor(entry, record, state),
        } satisfies EndingPivot,
      };
    })
    .sort((a, b) => b.score - a.score || a.pivot.turn - b.pivot.turn)
    .slice(0, 5)
    .map((item) => item.pivot)
    .sort((a, b) => a.turn - b.turn);
}

function structuralPivots(state: GameState): EndingPivot[] {
  if (state.history.length === 0) return [];
  const lowestProfit = [...state.history].sort((a, b) => a.profitRateReal - b.profitRateReal)[0];
  const highestConflict = [...state.history].sort((a, b) => b.contradiction - a.contradiction)[0];
  const highestInventory = [...state.history].sort(
    (a, b) => b.inventory / Math.max(1, b.demand) - a.inventory / Math.max(1, a.demand),
  )[0];

  return [
    {
      id: "structural-profit",
      turn: lowestProfit.turn,
      period: period(lowestProfit.turn),
      title: "Áp lực thực hiện lợi nhuận",
      mechanism: "Giá trị được sản xuất chỉ trở thành tiền khi hàng hóa tìm được người mua.",
      evidence: `p′ thực tế xuống ${percent(lowestProfit.profitRateReal)} với lợi nhuận ${money(lowestProfit.accountingProfit)}.`,
    },
    {
      id: "structural-inventory",
      turn: highestInventory.turn,
      period: period(highestInventory.turn),
      title: "Hàng hóa gặp giới hạn thị trường",
      mechanism: "Cung, cầu hiệu dụng và cạnh tranh cùng quyết định khả năng thực hiện giá trị.",
      evidence: `Tồn kho bằng ${percent(highestInventory.inventory / Math.max(1, highestInventory.demand))} nhu cầu của xưởng.`,
    },
    {
      id: "structural-conflict",
      turn: highestConflict.turn,
      period: period(highestConflict.turn),
      title: "Mâu thuẫn xã hội tích tụ",
      mechanism: "Quan hệ lao động và áp lực thị trường cùng tích tụ thành xung đột xã hội.",
      evidence: `Mâu thuẫn đạt ${Math.round(highestConflict.contradiction)}/100; bất ổn đạt ${Math.round(highestConflict.unrest)}/100.`,
    },
  ].sort((a, b) => a.turn - b.turn);
}

function thesisFor(state: GameState, ending: EndingId) {
  if (ending === "revolution") {
    if (state.contradiction >= BAL.contradictionRevolution) {
      return `Mâu thuẫn đạt ${Math.round(state.contradiction)}/100. Xung đột không còn được điều tiết trong khuôn khổ quản trị xưởng.`;
    }
    if (state.unrest >= BAL.unrestRiot && state.riotStreak >= 3) {
      return `Bất ổn duy trì ở ${Math.round(state.unrest)}/100 qua ${state.riotStreak} quý, biến phản kháng thành khủng hoảng chính trị.`;
    }
    return "Dữ liệu của ván dẫn tới cách mạng không còn trong bộ nhớ phiên này; hồ sơ không suy đoán một nguyên nhân không có bằng chứng.";
  }
  if (ending === "bankruptcy") {
    if (state.cash <= BAL.bankruptcyCashFloor) {
      return `Tiền mặt giảm xuống ${money(state.cash)}, thấp hơn ngưỡng thanh khoản ${money(BAL.bankruptcyCashFloor)}. Xưởng không còn khả năng tiếp tục chu chuyển.`;
    }
    if (state.debtStressStreak >= BAL.bankruptcyStressTurns) {
      return `Tỷ lệ nợ/tài sản vượt ngưỡng trong ${state.debtStressStreak} quý liên tiếp. Tín dụng không còn kéo dài được chu chuyển.`;
    }
    return "Dữ liệu của ván phá sản không còn trong bộ nhớ phiên này; hồ sơ không gán nguyên nhân thanh khoản hay tín dụng khi chưa có bằng chứng.";
  }
  if (ending === "monopoly") {
    return `Thị phần đạt ${(state.marketShare * 100).toFixed(1)}%. Lợi thế cá biệt đã chuyển thành tập trung tư bản, nhưng không xóa bỏ sức ép tích lũy.`;
  }
  if (ending === "merger") {
    return "Müller chấp nhận chuyển quyền kiểm soát cho Krupp. Đây là tập trung tư bản thông qua thâu tóm, không phải chiến thắng độc quyền của xưởng.";
  }
  if (ending === "reform") {
    return `Xưởng kết thúc với sức khỏe ${Math.round(state.health)}/100, mâu thuẫn ${Math.round(state.contradiction)}/100 và lợi nhuận quý cuối ${money(state.last.accountingProfit)}.`;
  }
  return "Sau 24 quý, các xu hướng tích lũy, cạnh tranh và xung đột vẫn vận động nhưng chưa kết tinh thành một kết cục cực điểm.";
}

function causalChain(state: GameState, ending: EndingId) {
  if (ending === "merger") {
    return ["Cạnh tranh", "Vị thế thị trường yếu", "Đề nghị thâu tóm", "Chuyển quyền kiểm soát"];
  }

  const chain: string[] = ["Sản xuất giá trị"];
  if (
    state.decisionHistory.some((entry) => entry.id === "BUY_MACHINE") ||
    state.history.some((record) => record.machines > record.machinesAtTurnStart)
  ) {
    chain.push("Cơ giới hóa và tích lũy");
  }
  if (state.decisionHistory.some((entry) => entry.id === "LAYOFF"))
    chain.push("Đội quân dự bị tăng");
  if (state.history.some((record) => record.exploitation > 1)) chain.push("m′ vượt 100%");
  if (
    state.history.some(
      (record) =>
        record.industrySupply > record.effectiveDemand &&
        record.inventory / Math.max(1, record.demand) > BAL.inventoryCrisisRatio,
    )
  ) {
    chain.push("Khó thực hiện hàng hóa");
  }
  if (state.history.some((record) => record.accountingProfit < 0))
    chain.push("Lợi nhuận thực tế âm");
  if (state.debt > 0 || state.history.some((record) => record.interestPaid > 0)) {
    chain.push("Áp lực tín dụng");
  }
  if (ending === "revolution") chain.push("Đứt gãy quan hệ lao động");
  else if (ending === "bankruptcy") chain.push("Chu chuyển bị gián đoạn");
  else if (ending === "monopoly") chain.push("Tập trung thị trường");
  else if (ending === "reform") chain.push("Cân bằng tạm thời");
  else chain.push("Mâu thuẫn còn mở");
  return chain.slice(0, 7);
}

function counterfactuals(ending: EndingId) {
  if (ending === "revolution") {
    return [
      "Giảm giờ, tăng lương hoặc thương lượng sớm có thể làm chậm tích tụ bất ổn.",
      "Các nhượng bộ có thể đổi nhịp xung đột, nhưng không tự xóa quan hệ giữa tư bản và lao động.",
    ];
  }
  if (ending === "bankruptcy") {
    return [
      "Giảm nợ, hạn chế mở rộng hoặc cắt sản lượng sớm có thể kéo dài thanh khoản.",
      "Một xưởng thận trọng hơn vẫn chịu chu kỳ cầu, cạnh tranh và cú sốc tín dụng của toàn ngành.",
    ];
  }
  if (ending === "merger") {
    return [
      "Giữ độc lập có thể bảo toàn quyền kiểm soát nhưng phải chấp nhận sức ép cầu và cạnh tranh tiếp tục.",
      "Sáp nhập giải quyết vị thế của một tư bản cá biệt bằng cách tập trung quyền sở hữu, không giải quyết mâu thuẫn của hệ thống.",
    ];
  }
  if (ending === "monopoly") {
    return [
      "Không mở rộng nhanh có thể giảm thị phần nhưng cũng giảm mức vốn bị khóa trong cạnh tranh.",
      "Ưu thế thị trường là tạm thời: lợi nhuận cao tiếp tục thu hút cạnh tranh và tích lũy mới.",
    ];
  }
  if (ending === "reform") {
    return [
      "Cải cách đã thay đổi điều kiện sống và nhịp xung đột một cách thực chất.",
      "Kết quả là cân bằng lịch sử có điều kiện, không phải bằng chứng rằng mâu thuẫn cấu trúc đã biến mất.",
    ];
  }
  return [
    "Những lựa chọn khác có thể đổi tốc độ tích lũy, phân phối và xung đột.",
    "Không có một nút bấm duy nhất bảo đảm kết cục vì thị trường, tín dụng và đấu tranh lao động cùng tác động.",
  ];
}

export function buildEndingReport(state: GameState, ending: EndingId): EndingReport {
  const totalProfit = state.history.reduce((sum, record) => sum + record.accountingProfit, 0);
  const totalSurplus = state.history.reduce((sum, record) => sum + record.m, 0);
  const peakExploitation = Math.max(0, ...state.history.map((record) => record.exploitation));
  const discovered = Object.keys(state.discoveredConcepts).length;
  const decisions = decisionPivots(state, ending);
  const pivotIds = new Set(decisions.map((pivot) => pivot.id));
  const supplementalPivots = structuralPivots(state)
    .filter((pivot) => !pivotIds.has(pivot.id))
    .slice(0, Math.max(0, 3 - decisions.length));
  const pivots = [...decisions, ...supplementalPivots].sort((a, b) => a.turn - b.turn);

  return {
    thesis: thesisFor(state, ending),
    qualification:
      "Các quyết định của Heinrich có thể tăng tốc, trì hoãn hoặc chuyển dạng kết cục. Báo cáo không quy một hiện tượng cấu trúc về một lựa chọn đạo đức đơn lẻ.",
    metrics: [
      {
        label: "Quý đã hoàn tất",
        value: `${state.history.length}/24`,
        detail: state.history.length
          ? `${period(1)} → ${period(state.history.at(-1)!.turn)}`
          : "Chưa có dữ liệu",
        tone: "neutral",
      },
      {
        label: "Lợi nhuận lũy kế",
        value: money(totalProfit),
        detail: "Lợi nhuận kế toán sau khấu hao và lãi",
        tone: totalProfit >= 0 ? "positive" : "warning",
      },
      {
        label: "m đã sản xuất",
        value: money(totalSurplus),
        detail: "Không đồng nhất với lợi nhuận thực hiện",
        tone: "neutral",
      },
      {
        label: "m′ cao nhất",
        value: percent(peakExploitation),
        detail: "Tỷ lệ giữa m và tư bản khả biến",
        tone: peakExploitation > 1 ? "warning" : "neutral",
      },
      {
        label: "Tiền mặt / dư nợ",
        value: `${money(state.cash)} / ${money(state.debt)}`,
        detail: `Chủ sở hữu đã rút ${money(state.ownerConsumption)}`,
        tone: state.cash < 0 || state.debtStressStreak > 0 ? "warning" : "neutral",
      },
      {
        label: "Khái niệm khám phá",
        value: `${discovered}/15`,
        detail: "Các hiện tượng đã được trải nghiệm trong ván",
        tone: discovered >= 12 ? "positive" : "neutral",
      },
    ],
    pivots,
    causalChain: causalChain(state, ending),
    counterfactuals: counterfactuals(ending),
  };
}

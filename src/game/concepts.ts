import { productivityPerWorker } from "./engine/laws";
import type { ActionId, ConceptDiscovery, ConceptKey, DiscoveryState, GameState } from "./types";

export interface ConceptInfo {
  key: ConceptKey;
  title: string;
  short: string;
  definition: string;
  formula?: string;
  quote?: { text: string; source: string };
  context: (s: GameState) => string;
}

export const CONCEPT_KEYS: ConceptKey[] = [
  "commodity",
  "socialLabor",
  "constantCapital",
  "variableCapital",
  "surplusValue",
  "absoluteSurplus",
  "relativeSurplus",
  "surplusRate",
  "capitalAccumulation",
  "organicComposition",
  "reserveArmy",
  "profitRate",
  "overproductionCrisis",
  "capitalistContradiction",
  "fallingProfitRate",
];

const money = (value: number) => `$${Math.round(value).toLocaleString("vi-VN")}`;
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const CONCEPT_INFO: Record<ConceptKey, ConceptInfo> = {
  commodity: {
    key: "commodity",
    title: "Hàng hóa",
    short: "H",
    definition:
      "Sản phẩm của lao động được tạo ra để trao đổi. Hàng hóa thống nhất giá trị sử dụng với giá trị.",
    context: (s) =>
      `Xưởng vừa sản xuất ${Math.round(s.last.output).toLocaleString("vi-VN")} đơn vị để bán trên thị trường.`,
  },
  socialLabor: {
    key: "socialLabor",
    title: "Lao động xã hội cần thiết",
    short: "tₓₕ",
    definition:
      "Thời gian cần để sản xuất một hàng hóa trong điều kiện sản xuất bình thường của xã hội, với trình độ kỹ thuật và cường độ lao động trung bình.",
    formula: "t cá biệt > t xã hội ⇒ bất lợi cạnh tranh",
    context: (s) =>
      `Xưởng cần ${s.last.individualLaborTime.toFixed(2)} giờ/đơn vị; mức xã hội là ${s.last.socialLaborTime.toFixed(2)} giờ.`,
  },
  constantCapital: {
    key: "constantCapital",
    title: "Tư bản bất biến",
    short: "c",
    definition:
      "Phần tư bản đầu tư vào tư liệu sản xuất. Giá trị của nó được chuyển dần vào sản phẩm nhưng không tự tạo ra giá trị mới.",
    formula: "c = khấu hao máy móc + nguyên liệu",
    context: (s) => `Xưởng có ${s.machines} máy; c quý gần nhất là ${money(s.last.c)}.`,
  },
  variableCapital: {
    key: "variableCapital",
    title: "Tư bản khả biến",
    short: "v",
    definition:
      "Phần tư bản dùng để mua sức lao động. Lao động sống tạo ra giá trị mới lớn hơn giá trị sức lao động của chính nó.",
    formula: "v = số công nhân × tiền lương",
    context: (s) => `Kỳ lương gần nhất là ${money(s.last.v)} cho ${s.workersActive} công nhân.`,
  },
  surplusValue: {
    key: "surplusValue",
    title: "Giá trị thặng dư",
    short: "m",
    definition:
      "Phần giá trị mới do công nhân tạo ra vượt quá giá trị sức lao động và bị nhà tư bản chiếm hữu.",
    formula: "m = giá trị mới − v",
    context: (s) => `Giá trị thặng dư quý gần nhất là ${money(s.last.m)}.`,
  },
  absoluteSurplus: {
    key: "absoluteSurplus",
    title: "Giá trị thặng dư tuyệt đối",
    short: "m tuyệt đối",
    definition:
      "Giá trị thặng dư tăng lên bằng cách kéo dài ngày lao động trong khi thời gian lao động cần thiết không đổi.",
    formula: "Ngày lao động dài hơn ⇒ lao động thặng dư tăng",
    context: (s) => `Ngày lao động hiện kéo dài ${s.workHours} giờ.`,
  },
  relativeSurplus: {
    key: "relativeSurplus",
    title: "Giá trị thặng dư tương đối",
    short: "m tương đối",
    definition:
      "Giá trị thặng dư tăng nhờ nâng năng suất, qua đó rút ngắn thời gian lao động cần thiết trong cùng một ngày lao động.",
    formula: "Năng suất tăng ⇒ thời gian cần thiết giảm",
    context: (s) => `Năng suất hiện tại là ${s.last.laborProductivity.toFixed(3)} đơn vị/giờ.`,
  },
  surplusRate: {
    key: "surplusRate",
    title: "Tỷ suất giá trị thặng dư",
    short: "m′",
    definition:
      "Tỷ lệ giữa giá trị thặng dư và tư bản khả biến, phản ánh mức độ sử dụng lao động thặng dư so với lao động cần thiết.",
    formula: "m′ = m / v × 100%",
    context: (s) => `m′ quý gần nhất đạt ${percent(s.last.exploitation)}.`,
  },
  capitalAccumulation: {
    key: "capitalAccumulation",
    title: "Tích lũy tư bản",
    short: "TL",
    definition:
      "Quá trình biến một phần giá trị thặng dư thành tư bản phụ thêm để mở rộng quy mô sản xuất.",
    formula: "Lợi nhuận → tái đầu tư → tư bản lớn hơn",
    context: (s) => `Quy mô hiện tại: ${s.machines} máy và ${s.workersActive} công nhân.`,
  },
  organicComposition: {
    key: "organicComposition",
    title: "Cấu tạo hữu cơ của tư bản",
    short: "c/v",
    definition:
      "Tỷ lệ giữa tư bản bất biến và tư bản khả biến, phản ánh cấu tạo kỹ thuật của sản xuất dưới hình thái giá trị.",
    formula: "Cấu tạo hữu cơ = c / v",
    context: (s) => `c/v quý gần nhất là ${s.last.organic.toFixed(2)}.`,
  },
  reserveArmy: {
    key: "reserveArmy",
    title: "Đội quân công nghiệp dự bị",
    short: "D",
    definition:
      "Bộ phận lao động thất nghiệp hoặc thiếu việc làm luôn sẵn sàng được tư bản huy động, đồng thời tạo sức ép lên người đang có việc.",
    context: (s) => `Có ${s.workersIdle} lao động đang thất nghiệp.`,
  },
  profitRate: {
    key: "profitRate",
    title: "Tỷ suất lợi nhuận",
    short: "p′",
    definition:
      "Tỷ lệ giữa giá trị thặng dư và toàn bộ tư bản ứng trước, biểu hiện hiệu quả sinh lợi của tổng tư bản.",
    formula: "p′ = m / (c + v) × 100%",
    context: (s) => `p′ quý gần nhất là ${percent(s.last.profitRate)}.`,
  },
  overproductionCrisis: {
    key: "overproductionCrisis",
    title: "Khủng hoảng thừa",
    short: "KT",
    definition:
      "Hàng hóa được sản xuất vượt quá khả năng hấp thụ có khả năng thanh toán của thị trường, khiến tồn kho tăng và lợi nhuận chịu sức ép.",
    formula: "Sản xuất > cầu có khả năng thanh toán ⇒ tồn kho",
    context: (s) =>
      `Tồn kho bằng ${percent(s.inventory / Math.max(1, s.demand))} nhu cầu hiện tại.`,
  },
  capitalistContradiction: {
    key: "capitalistContradiction",
    title: "Mâu thuẫn cơ bản của chủ nghĩa tư bản",
    short: "K",
    definition:
      "Mâu thuẫn giữa tính chất xã hội hóa ngày càng cao của sản xuất và chế độ chiếm hữu tư nhân tư bản chủ nghĩa đối với tư liệu sản xuất.",
    context: (s) => `Chỉ số mâu thuẫn hiện ở mức ${Math.round(s.contradiction)}/100.`,
  },
  fallingProfitRate: {
    key: "fallingProfitRate",
    title: "Quy luật tỷ suất lợi nhuận có xu hướng giảm",
    short: "p′ ↓",
    definition:
      "Khi tư bản bất biến tăng nhanh hơn tư bản khả biến, tỷ suất lợi nhuận có xu hướng giảm dù tổng giá trị thặng dư vẫn có thể tăng.",
    formula: "p′ = m′ / (1 + c/v)",
    context: (s) => {
      const rates = s.history.slice(-4).map((record) => percent(record.profitRate));
      return `Bốn mức p′ gần nhất: ${rates.join(" → ")}.`;
    },
  },
};

function discovery(
  key: ConceptKey,
  state: GameState,
  action: string,
  consequence: string,
): ConceptDiscovery {
  return { key, turn: state.turn, quarter: state.quarter, year: state.year, action, consequence };
}

interface ActionDiscoveryInput {
  prev: GameState;
  next: GameState;
  actionId: ActionId;
  investmentThisTurn: number;
  layoffsThisTurn: number;
  workersAtTurnStart: number;
  discovered: DiscoveryState;
}

export function checkActionDiscoveries(input: ActionDiscoveryInput): ConceptDiscovery[] {
  const { prev, next, actionId, discovered } = input;
  const result: ConceptDiscovery[] = [];
  const add = (key: ConceptKey, action: string, consequence: string) => {
    if (!discovered[key] && !result.some((item) => item.key === key)) {
      result.push(discovery(key, next, action, consequence));
    }
  };

  if (actionId === "BUY_MACHINE") {
    add(
      "constantCapital",
      "Bạn vừa dùng tiền mua thêm máy móc.",
      `Tiền mặt giảm ${money(prev.cash - next.cash)} và số máy tăng từ ${prev.machines} lên ${next.machines}.`,
    );
    const before = productivityPerWorker(prev.machines, prev.workersActive, prev.health);
    const after = productivityPerWorker(next.machines, next.workersActive, next.health);
    if (after > before) {
      add(
        "relativeSurplus",
        "Bạn vừa thay lao động thủ công bằng năng lực máy móc lớn hơn.",
        `Năng suất kỹ thuật mỗi công nhân tăng ${percent(after / before - 1)}.`,
      );
    }
  }

  if (actionId === "EXTEND_HOURS") {
    add(
      "absoluteSurplus",
      "Bạn vừa kéo dài ngày lao động.",
      `Giờ làm tăng từ ${prev.workHours} lên ${next.workHours} giờ và bất ổn tăng ${(next.unrest - prev.unrest).toFixed(1)} điểm.`,
    );
  }

  const previousProfit = Math.max(0, prev.last.profit);
  if (previousProfit > 0 && input.investmentThisTurn > previousProfit * 0.5) {
    add(
      "capitalAccumulation",
      "Bạn vừa đưa phần lớn lợi nhuận trở lại sản xuất.",
      `Đầu tư trong quý đạt ${money(input.investmentThisTurn)}, bằng ${percent(input.investmentThisTurn / previousProfit)} lợi nhuận quý trước.`,
    );
  }

  if (
    actionId === "LAYOFF" &&
    input.workersAtTurnStart > 0 &&
    input.layoffsThisTurn / input.workersAtTurnStart > 0.2
  ) {
    add(
      "reserveArmy",
      "Bạn vừa sa thải hơn một phần năm lực lượng lao động đầu quý.",
      `${input.layoffsThisTurn} người mất việc; lực lượng thất nghiệp tăng lên ${next.workersIdle}.`,
    );
  }

  return result;
}

export function checkQuarterDiscoveries(state: GameState): ConceptDiscovery[] {
  const record = state.history.at(-1);
  if (!record) return [];

  const previous = state.history.at(-2);
  const discovered = state.discoveredConcepts;
  const result: ConceptDiscovery[] = [];
  const add = (key: ConceptKey, action: string, consequence: string) => {
    if (!discovered[key] && !result.some((item) => item.key === key)) {
      result.push({
        key,
        turn: record.turn,
        quarter: record.quarter,
        year: record.year,
        action,
        consequence,
      });
    }
  };

  if (record.output > 0) {
    add(
      "commodity",
      "Bạn vừa hoàn tất một lô sản phẩm để đưa ra thị trường.",
      `Xưởng sản xuất ${Math.round(record.output).toLocaleString("vi-VN")} đơn vị và bán chúng để thu doanh thu.`,
    );
  }
  if (record.individualLaborTime > record.socialLaborTime) {
    add(
      "socialLabor",
      "Xưởng của bạn vừa sản xuất chậm hơn mặt bằng xã hội.",
      `Mỗi đơn vị cần ${record.individualLaborTime.toFixed(2)} giờ, cao hơn mức xã hội ${record.socialLaborTime.toFixed(2)} giờ.`,
    );
  }
  if (record.v > 0) {
    add(
      "variableCapital",
      "Bạn vừa trả lương cho lực lượng lao động.",
      `${money(record.v)} được ứng ra để mua sức lao động trong quý.`,
    );
  }
  if (record.m > 0 && record.profit > 0) {
    add(
      "surplusValue",
      "Bạn vừa kết thúc quý với giá trị mới vượt quá tiền lương đã trả.",
      `Công nhân tạo ra ${money(record.m)} giá trị thặng dư; lợi nhuận thực tế là ${money(record.profit)}.`,
    );
  }
  if (record.exploitation > 1) {
    add(
      "surplusRate",
      "Lao động thặng dư vừa vượt lao động cần thiết.",
      `m′ đạt ${percent(record.exploitation)}: mỗi 1 đồng lương tương ứng hơn 1 đồng giá trị thặng dư.`,
    );
  }
  if (record.organic > 3) {
    add(
      "organicComposition",
      "Giá trị máy móc và nguyên liệu vừa lớn hơn ba lần quỹ lương.",
      `Cấu tạo c/v đạt ${record.organic.toFixed(2)}.`,
    );
  }
  if (record.turn >= 12 && previous && record.profitRate < previous.profitRate) {
    add(
      "profitRate",
      "Sau lượt 12, hiệu quả sinh lợi của tổng tư bản vừa giảm.",
      `p′ giảm từ ${percent(previous.profitRate)} xuống ${percent(record.profitRate)}.`,
    );
  }
  if (record.inventory / Math.max(1, record.demand) > 0.7) {
    add(
      "overproductionCrisis",
      "Bạn vừa sản xuất nhiều hơn khả năng hấp thụ của thị trường.",
      `Tồn kho bằng ${percent(record.inventory / Math.max(1, record.demand))} nhu cầu.`,
    );
  }
  if (state.contradiction > 75) {
    add(
      "capitalistContradiction",
      "Các quyết định tích lũy đã đẩy xung đột xã hội vượt ngưỡng nguy hiểm.",
      `Chỉ số mâu thuẫn đạt ${Math.round(state.contradiction)}/100.`,
    );
  }

  const lastFour = state.history.slice(-4);
  if (
    lastFour.length === 4 &&
    lastFour[0].profitRate > lastFour[1].profitRate &&
    lastFour[1].profitRate > lastFour[2].profitRate &&
    lastFour[2].profitRate > lastFour[3].profitRate
  ) {
    add(
      "fallingProfitRate",
      "Bạn vừa chứng kiến tỷ suất lợi nhuận giảm trong ba quý liên tiếp.",
      `p′ đi từ ${percent(lastFour[0].profitRate)} xuống ${percent(lastFour[3].profitRate)}.`,
    );
  }

  return result;
}

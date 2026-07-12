import { BAL } from "./balance";
import type { ConceptDiscovery, ConceptKey, DiscoveryState, GameState } from "./types";

export interface ConceptInfo {
  key: ConceptKey;
  title: string;
  short: string;
  definition: string;
  formula?: string;
  quote?: { text: string; source: string };
  context: (state: GameState) => string;
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
    context: (state) =>
      `Xưởng vừa sản xuất ${Math.round(state.last.output).toLocaleString("vi-VN")} đơn vị để bán trên thị trường.`,
  },
  socialLabor: {
    key: "socialLabor",
    title: "Lao động xã hội cần thiết",
    short: "tₓₕ",
    definition:
      "Thời gian cần để sản xuất một hàng hóa trong điều kiện sản xuất bình thường của xã hội, với trình độ kỹ thuật và cường độ lao động trung bình.",
    formula: "t cá biệt > t xã hội ⇒ một phần lao động không được xã hội thừa nhận",
    context: (state) =>
      `Xưởng cần ${state.last.individualLaborTime.toFixed(2)} giờ/đơn vị; mức xã hội là ${state.last.socialLaborTime.toFixed(2)} giờ.`,
  },
  constantCapital: {
    key: "constantCapital",
    title: "Tư bản bất biến",
    short: "c",
    definition:
      "Phần tư bản đầu tư vào tư liệu sản xuất. Nguyên liệu và phần giá trị máy hao mòn được chuyển vào sản phẩm, nhưng không tự tạo ra giá trị mới.",
    formula: "c chuyển dịch = nguyên liệu + khấu hao",
    context: (state) =>
      `Xưởng có ${state.machines} máy trị giá sổ sách ${money(state.machineBookValue)}; c chuyển dịch quý gần nhất là ${money(state.last.cTransferred)}.`,
  },
  variableCapital: {
    key: "variableCapital",
    title: "Tư bản khả biến",
    short: "v",
    definition:
      "Phần tư bản dùng để mua sức lao động. Lao động sống tái tạo giá trị sức lao động và có thể tạo thêm giá trị thặng dư.",
    formula: "v = số công nhân × tiền lương quý",
    context: (state) =>
      `Kỳ lương gần nhất là ${money(state.last.v)} cho ${state.workersActive} công nhân.`,
  },
  surplusValue: {
    key: "surplusValue",
    title: "Giá trị thặng dư",
    short: "m",
    definition:
      "Phần giá trị mới do công nhân tạo ra vượt quá giá trị sức lao động và bị nhà tư bản chiếm hữu.",
    formula: "m = giá trị mới − v",
    context: (state) =>
      `m sản xuất là ${money(state.last.m)}; lợi nhuận kế toán thực hiện là ${money(state.last.accountingProfit)}.`,
  },
  absoluteSurplus: {
    key: "absoluteSurplus",
    title: "Giá trị thặng dư tuyệt đối",
    short: "m tuyệt đối",
    definition:
      "Giá trị thặng dư tăng lên bằng cách kéo dài ngày lao động trong khi giá trị sức lao động không đổi.",
    formula: "Ngày lao động dài hơn ⇒ lao động thặng dư tăng",
    context: (state) => `Ngày lao động hiện kéo dài ${state.workHours} giờ.`,
  },
  relativeSurplus: {
    key: "relativeSurplus",
    title: "Giá trị thặng dư tương đối",
    short: "m tương đối",
    definition:
      "Một xưởng đi trước kỹ thuật trước hết thu lợi nhuận siêu ngạch. Khi năng suất mới được xã hội hóa và làm rẻ tư liệu sinh hoạt, lao động cần thiết rút ngắn và giá trị thặng dư tương đối tăng.",
    formula: "Năng suất xã hội ↑ ⇒ lao động cần thiết ↓",
    context: (state) =>
      `Năng suất là ${state.last.laborProductivity.toFixed(3)} đơn vị/giờ; lợi nhuận siêu ngạch ước tính ${money(state.last.extraProfit)}.`,
  },
  surplusRate: {
    key: "surplusRate",
    title: "Tỷ suất giá trị thặng dư",
    short: "m′",
    definition:
      "Tỷ lệ giữa giá trị thặng dư và tư bản khả biến, phản ánh lao động thặng dư so với lao động cần thiết.",
    formula: "m′ = m / v × 100%",
    context: (state) => `m′ quý gần nhất đạt ${percent(state.last.exploitation)}.`,
  },
  capitalAccumulation: {
    key: "capitalAccumulation",
    title: "Tích lũy tư bản",
    short: "TL",
    definition:
      "Quá trình biến một phần giá trị thặng dư thành tư bản phụ thêm để mở rộng quy mô sản xuất. Tiền chỉ trở thành tích lũy thực tế khi quay lại tư liệu sản xuất hoặc sức lao động.",
    formula: "m giữ lại → quỹ tích lũy → tư bản phụ thêm",
    context: (state) =>
      `Quỹ tích lũy còn ${money(state.accumulationFund)}; quy mô hiện tại là ${state.machines} máy.`,
  },
  organicComposition: {
    key: "organicComposition",
    title: "Cấu tạo hữu cơ của tư bản",
    short: "c/v",
    definition:
      "Tỷ lệ giá trị giữa tư bản bất biến và tư bản khả biến, phản ánh cấu tạo kỹ thuật của sản xuất dưới hình thái giá trị.",
    formula: "Cấu tạo hữu cơ = c ứng trước / v",
    context: (state) => `c/v quý gần nhất là ${state.last.organic.toFixed(2)}.`,
  },
  reserveArmy: {
    key: "reserveArmy",
    title: "Đội quân công nghiệp dự bị",
    short: "D",
    definition:
      "Bộ phận lao động thất nghiệp hoặc thiếu việc làm luôn sẵn sàng được tư bản huy động, đồng thời tạo sức ép lên người đang có việc.",
    context: (state) => `Có ${state.workersIdle} lao động đang thất nghiệp.`,
  },
  profitRate: {
    key: "profitRate",
    title: "Tỷ suất lợi nhuận",
    short: "p′",
    definition:
      "Tỷ lệ giữa giá trị thặng dư và toàn bộ tư bản ứng trước. Trong game, đây là tỷ suất của một quý giản lược.",
    formula: "p′ quý = m / (c ứng trước + v) × 100%",
    context: (state) => `p′ lý thuyết quý gần nhất là ${percent(state.last.profitRate)}.`,
  },
  overproductionCrisis: {
    key: "overproductionCrisis",
    title: "Khủng hoảng thừa",
    short: "KT",
    definition:
      "Hàng hóa được sản xuất vượt quá khả năng hấp thụ có khả năng thanh toán của thị trường, khiến tồn kho tăng và lợi nhuận chịu sức ép.",
    formula: "Cung ngành > cầu hiệu dụng và tồn kho cao",
    context: (state) =>
      `Tồn kho bằng ${percent(state.inventory / Math.max(1, state.demand))} nhu cầu hiện tại.`,
  },
  capitalistContradiction: {
    key: "capitalistContradiction",
    title: "Mâu thuẫn cơ bản của chủ nghĩa tư bản",
    short: "K",
    definition:
      "Mâu thuẫn giữa tính chất xã hội hóa ngày càng cao của sản xuất và chế độ chiếm hữu tư nhân tư bản chủ nghĩa đối với tư liệu sản xuất.",
    context: (state) => `Chỉ số mâu thuẫn hiện ở mức ${Math.round(state.contradiction)}/100.`,
  },
  fallingProfitRate: {
    key: "fallingProfitRate",
    title: "Quy luật tỷ suất lợi nhuận có xu hướng giảm",
    short: "p′ ↓",
    definition:
      "Khi tư bản bất biến tăng nhanh hơn tư bản khả biến, tỷ suất lợi nhuận có xu hướng giảm dù tổng giá trị thặng dư vẫn có thể tăng; các nhân tố chống lại có thể làm xu hướng này gián đoạn.",
    formula: "p′ = m′ / (1 + c/v)",
    context: (state) => {
      const rates = state.history.slice(-4).map((record) => percent(record.profitRate));
      return `Bốn mức p′ quý gần nhất: ${rates.join(" → ")}.`;
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

export interface ImmediateDiscoveryInput {
  prev: GameState;
  next: GameState;
  cause: "decision" | "event";
  workersAtTurnStart: number;
  discovered: DiscoveryState;
}

export function checkImmediateDiscoveries(input: ImmediateDiscoveryInput): ConceptDiscovery[] {
  const { prev, next, cause, discovered } = input;
  const result: ConceptDiscovery[] = [];
  const add = (key: ConceptKey, action: string, consequence: string) => {
    if (!discovered[key] && !result.some((item) => item.key === key)) {
      result.push(discovery(key, next, action, consequence));
    }
  };
  const subject = cause === "decision" ? "Bạn vừa" : "Một sự kiện vừa";

  if (next.machines > prev.machines) {
    add(
      "constantCapital",
      `${subject} đưa thêm máy móc vào xưởng.`,
      `Số máy tăng từ ${prev.machines} lên ${next.machines}; giá trị sổ sách máy tăng ${money(next.machineBookValue - prev.machineBookValue)}.`,
    );
  }

  if (next.workHours > prev.workHours) {
    add(
      "absoluteSurplus",
      `${subject} kéo dài ngày lao động.`,
      `Giờ làm tăng từ ${prev.workHours} lên ${next.workHours} giờ trong khi tiền lương quý chưa đổi.`,
    );
  }

  const laidOff = Math.max(0, prev.workersActive - next.workersActive);
  if (laidOff > 0 && input.workersAtTurnStart > 0 && laidOff / input.workersAtTurnStart > 0.2) {
    add(
      "reserveArmy",
      `${subject} đẩy hơn một phần năm lực lượng lao động đầu quý ra khỏi xưởng.`,
      `${laidOff} người mất việc; xưởng hiện có ${next.workersIdle} lao động dự bị.`,
    );
  }

  const bookValueAdded = Math.max(0, next.machineBookValue - prev.machineBookValue);
  const capitalized = next.capitalizedAccumulationThisTurn - prev.capitalizedAccumulationThisTurn;
  if (bookValueAdded > 0 && capitalized >= bookValueAdded * 0.5) {
    add(
      "capitalAccumulation",
      `${subject} biến lợi nhuận giữ lại thành máy móc mới.`,
      `${money(capitalized)} từ quỹ tích lũy đã tài trợ ${percent(capitalized / bookValueAdded)} giá trị máy mua thêm.`,
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

  if (record.turn === 1) {
    if (record.output > 0) {
      add(
        "commodity",
        "Xưởng vừa hoàn tất lô sản phẩm đầu tiên để trao đổi.",
        `${Math.round(record.output).toLocaleString("vi-VN")} đơn vị được sản xuất và đưa ra thị trường.`,
      );
    }
    if (record.v > 0) {
      add(
        "variableCapital",
        "Xưởng vừa ứng tiền để mua sức lao động trong quý.",
        `Quỹ lương đạt ${money(record.v)} cho lực lượng lao động đang hoạt động.`,
      );
    }
    if (record.m > 0) {
      add(
        "surplusValue",
        "Bạn vừa chứng kiến lao động sống tạo ra giá trị vượt quá quỹ lương.",
        `Giá trị mới là ${money(record.newValue)}, m là ${money(record.m)}, còn lợi nhuận kế toán là ${money(record.accountingProfit)}.`,
      );
    }
    return result;
  }

  if (record.individualLaborTime > record.socialLaborTime) {
    add(
      "socialLabor",
      "Bạn vừa chứng kiến lao động cá biệt của xưởng bị so sánh với mặt bằng xã hội.",
      `Mỗi đơn vị cần ${record.individualLaborTime.toFixed(2)} giờ, cao hơn mức xã hội ${record.socialLaborTime.toFixed(2)} giờ.`,
    );
  }

  if (
    record.machines > record.machinesAtTurnStart &&
    state.workHours === record.workHoursAtTurnStart &&
    record.laborProductivity > record.laborProductivityAtTurnStart &&
    record.individualLaborTime < record.socialLaborTime
  ) {
    add(
      "relativeSurplus",
      "Bạn vừa chứng kiến một xưởng đi trước năng suất mà không kéo dài ngày lao động.",
      `Thời gian cá biệt ${record.individualLaborTime.toFixed(2)} giờ thấp hơn mức xã hội ${record.socialLaborTime.toFixed(2)} giờ; lợi nhuận siêu ngạch ước tính ${money(record.extraProfit)}.`,
    );
  }

  if (record.exploitation > 1) {
    add(
      "surplusRate",
      "Bạn vừa chứng kiến lao động thặng dư vượt lao động cần thiết.",
      `m′ đạt ${percent(record.exploitation)}; mỗi 1 đồng v tương ứng hơn 1 đồng m.`,
    );
  }

  if (
    previous &&
    (previous.organic <= BAL.organicDiscoveryThreshold || previous.turn === 1) &&
    record.organic > BAL.organicDiscoveryThreshold &&
    record.machines > 3
  ) {
    add(
      "organicComposition",
      "Bạn vừa chứng kiến tư liệu sản xuất tăng nhanh hơn quỹ lương.",
      `c/v tăng từ ${previous.organic.toFixed(2)} lên ${record.organic.toFixed(2)}.`,
    );
  }

  if (record.turn >= 12 && previous && record.profitRate < previous.profitRate) {
    add(
      "profitRate",
      "Bạn vừa chứng kiến tỷ suất sinh lợi của tổng tư bản ứng trước giảm.",
      `p′ quý giảm từ ${percent(previous.profitRate)} xuống ${percent(record.profitRate)}.`,
    );
  }

  if (
    record.industrySupply > record.effectiveDemand &&
    record.inventory / Math.max(1, record.demand) > BAL.inventoryCrisisRatio
  ) {
    add(
      "overproductionCrisis",
      "Bạn vừa chứng kiến sản xuất ngành vượt khả năng thực hiện trên thị trường.",
      `Tồn kho xưởng bằng ${percent(record.inventory / Math.max(1, record.demand))} nhu cầu, trong khi cung ngành vượt cầu hiệu dụng.`,
    );
  }

  if (state.contradiction > 75) {
    add(
      "capitalistContradiction",
      "Bạn vừa chứng kiến xung đột giữa sản xuất xã hội hóa và chiếm hữu tư nhân vượt ngưỡng nguy hiểm.",
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
      "Bạn vừa chứng kiến p′ quý giảm trong ba lần liên tiếp.",
      `p′ đi từ ${percent(lastFour[0].profitRate)} xuống ${percent(lastFour[3].profitRate)}.`,
    );
  }

  return result;
}

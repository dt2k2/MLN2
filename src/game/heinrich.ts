import { BAL } from "./balance";
import type { GameState, OwnerSignal, OwnerStance } from "./types";

export type HeroCondition =
  | "neutral"
  | "expansion"
  | "hardline"
  | "market-crisis"
  | "labor-conflict"
  | "rupture"
  | "dominant";

export interface HeinrichPresentation {
  condition: HeroCondition;
  stance: OwnerStance;
  label: string;
  hint: string;
  tone: string;
  monologue: string;
  videoFile: string;
}

export const HERO_VIDEO_FILES: Record<HeroCondition, string> = {
  neutral: "01-neutral.mp4",
  expansion: "02-expansion.mp4",
  hardline: "03-hardline.mp4",
  "market-crisis": "04-market-crisis.mp4",
  "labor-conflict": "05-labor-conflict.mp4",
  rupture: "06-rupture.mp4",
  dominant: "07-dominant.mp4",
};

const CONDITION_META: Record<
  HeroCondition,
  Pick<HeinrichPresentation, "label" | "hint" | "tone">
> = {
  neutral: {
    label: "Điềm tĩnh",
    hint: "Xưởng chưa chịu một áp lực nổi trội.",
    tone: "border-[color:var(--success)]/50 text-[color:var(--success)]",
  },
  expansion: {
    label: "Tham vọng",
    hint: "Lợi nhuận đang được chuyển thành năng lực sản xuất mới.",
    tone: "border-gold/50 text-gold",
  },
  hardline: {
    label: "Cứng rắn",
    hint: "Kỷ luật lao động đang bị siết sau lựa chọn cưỡng ép.",
    tone: "border-[color:var(--contradiction)]/60 text-[color:var(--contradiction)]",
  },
  "market-crisis": {
    label: "Lo âu",
    hint: "Giá trị sản xuất ra gặp khó khăn khi thực hiện trên thị trường.",
    tone: "border-[color:var(--info)]/60 text-[color:var(--info)]",
  },
  "labor-conflict": {
    label: "Bị thách thức",
    hint: "Quan hệ giữa chủ xưởng và công nhân đã thành xung đột công khai.",
    tone: "border-destructive/60 text-destructive",
  },
  rupture: {
    label: "Mất kiểm soát",
    hint: "Mâu thuẫn đã vượt khỏi khả năng điều tiết thông thường.",
    tone: "border-destructive/80 text-destructive",
  },
  dominant: {
    label: "Đắc thế",
    hint: "Xưởng đang có ưu thế rõ rệt nhưng vẫn chịu quy luật thị trường.",
    tone: "border-gold/70 text-gold",
  },
};

const DEFAULT_LINES: Record<HeroCondition, string[]> = {
  neutral: [
    "Các con số vẫn trong tầm kiểm soát. Quý tới mới là phép thử.",
    "Máy, người và đơn hàng đang giữ nhịp. Chưa có gì bảo đảm lâu dài.",
    "Một quý yên không có nghĩa là những sức ép đã biến mất.",
  ],
  expansion: [
    "Phần lợi nhuận giữ lại phải biến thành năng lực sản xuất thực sự.",
    "Máy mới chỉ có ý nghĩa nếu hàng hóa tìm được người mua.",
    "Mở rộng hôm nay cũng là bước vào một cuộc cạnh tranh lớn hơn.",
  ],
  hardline: [
    "Muốn giữ nhịp máy, ta đang buộc con người phải chịu thêm sức ép.",
    "Kỷ luật có thể giữ sản lượng, nhưng nó cũng đang tích tụ phản kháng.",
    "Sổ lương nhẹ đi; bầu không khí trong xưởng lại nặng hơn.",
  ],
  "market-crisis": [
    "Kho đầy lên, nhưng giá trị chỉ thành tiền khi hàng hóa được bán.",
    "Sản xuất vẫn chạy mà dòng tiền co lại. Thị trường đang phủ định sổ sách.",
    "Càng cố bán, sức ép cạnh tranh càng bào mòn lợi nhuận.",
  ],
  "labor-conflict": [
    "Xưởng không thể vận hành như cũ khi công nhân đã hành động tập thể.",
    "Mâu thuẫn trong sổ lương giờ đã bước ra trước cổng xưởng.",
    "Máy vẫn ở đó, nhưng quyền điều khiển nhịp sản xuất đang bị tranh chấp.",
  ],
  rupture: [
    "Những gì từng là con số riêng lẻ giờ đã kết thành một cuộc khủng hoảng.",
    "Mệnh lệnh không còn đủ sức giữ mọi thứ trong khuôn cũ.",
    "Xưởng vẫn thuộc về ta trên giấy, nhưng thực tại đang đổi khác.",
  ],
  dominant: [
    "Ưu thế này đến từ năng suất và thị phần, không phải một chiến thắng vĩnh viễn.",
    "Đối thủ đang lùi lại, còn áp lực tích lũy thì tiến gần hơn.",
    "Lợi nhuận cao hôm nay sẽ gọi thêm tư bản vào cuộc cạnh tranh ngày mai.",
  ],
};

const STANCE_LINES: Partial<Record<HeroCondition, Partial<Record<OwnerStance, string[]>>>> = {
  "labor-conflict": {
    reformist: [
      "Phải mở bàn thương lượng trước khi cả xưởng ngừng lại.",
      "Nhượng bộ có thể tốn kém, nhưng đối đầu sẽ làm mâu thuẫn sâu hơn.",
    ],
    coercive: [
      "Nếu lùi bước lúc này, quyền điều hành xưởng sẽ bị thách thức.",
      "Ta đã chọn cưỡng ép; giờ phản kháng đang đáp lại bằng sức mạnh tập thể.",
    ],
  },
  rupture: {
    reformist: [
      "Những nhượng bộ muộn màng có còn đủ để ngăn đổ vỡ không?",
      "Ta đã cố điều hòa, nhưng mâu thuẫn đã lớn hơn ý chí của một chủ xưởng.",
    ],
    coercive: [
      "Càng siết chặt, tình thế càng thoát khỏi tay ta.",
      "Trấn áp không xóa được nguyên nhân đã đưa họ ra đường.",
    ],
  },
  "market-crisis": {
    speculative: [
      "Tín dụng từng kéo dài cuộc chạy đua; giờ khoản nợ đang rút ngắn thời gian.",
      "Tiền vay mua được thời gian, không mua được sức cầu.",
    ],
    expansionist: [
      "Năng lực sản xuất đã tăng nhanh hơn khả năng thực hiện hàng hóa.",
      "Mở rộng xưởng không tự mở rộng thị trường.",
    ],
  },
  hardline: {
    coercive: [
      "Ta đã chọn kỷ luật bằng sức ép; cái giá đang hiện trên khuôn mặt công nhân.",
      "Ngày lao động dài hơn làm phần thặng dư lớn hơn, và cả sự chống đối cũng vậy.",
    ],
  },
};

export function getRecentOwnerSignals(state: GameState): OwnerSignal[] {
  return state.ownerSignals.filter((signal) => state.turn - signal.turn <= 4).slice(-4);
}

function happenedRecently(state: GameState, eventId: string, age = 1) {
  const pending = state.pendingEvent?.id === eventId;
  const lastTurn = state.eventHistory[eventId]?.lastTurn;
  return pending || (lastTurn !== undefined && state.turn - lastTurn <= age);
}

function actualExpansionOccurred(state: GameState) {
  const previous = state.history.at(-2);
  const machinesGrew =
    state.machines > state.machinesAtTurnStart ||
    (!!previous && state.last.machines > previous.machines);
  const accumulationCapitalized =
    state.capitalizedAccumulationThisTurn > 0 || state.last.capitalizedAccumulation > 0;
  return machinesGrew || accumulationCapitalized;
}

export function deriveHeroCondition(state: GameState): HeroCondition {
  const inventoryRatio = state.inventory / Math.max(1, state.demand);
  const riotNear = state.riotStreak >= 2 || happenedRecently(state, "workers-district-riot", 0);
  const strikeOrRiot =
    happenedRecently(state, "factory-strike") || happenedRecently(state, "workers-district-riot");

  if (state.ending === "revolution" || state.contradiction >= 85 || riotNear) {
    return "rupture";
  }
  if (state.unrest >= 70 || strikeOrRiot) return "labor-conflict";
  if (
    state.overstockStreak >= 2 ||
    state.debtStressStreak >= 2 ||
    (state.last.accountingProfit < 0 && inventoryRatio > BAL.inventoryCrisisRatio)
  ) {
    return "market-crisis";
  }

  const signals = getRecentOwnerSignals(state);
  const latest = signals.at(-1);
  const recentLayoff = signals.some(
    (signal) =>
      signal.stance === "coercive" &&
      (signal.source.includes("LAYOFF") || signal.source.includes("union-founded")),
  );
  const hardlinePressure =
    state.workHours > BAL.baseWorkHours ||
    state.wagePerWorker < BAL.baseWagePerWorker ||
    recentLayoff ||
    state.last.exploitation > 1;
  if (latest?.stance === "coercive" && hardlinePressure) return "hardline";

  if (
    state.marketShare >= 0.5 &&
    state.last.accountingProfit > 0 &&
    state.last.profitRateReal > 0.08
  ) {
    return "dominant";
  }
  if (
    latest?.stance === "expansionist" &&
    actualExpansionOccurred(state) &&
    state.last.accountingProfit > 0
  ) {
    return "expansion";
  }
  return "neutral";
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function deriveHeinrichPresentation(state: GameState): HeinrichPresentation {
  const condition = deriveHeroCondition(state);
  const signals = getRecentOwnerSignals(state);
  const latest = signals.at(-1);
  const stance = latest?.stance ?? "pragmatic";
  const lines = STANCE_LINES[condition]?.[stance] ?? DEFAULT_LINES[condition];
  const lineKey = `${state.seed}:${state.turn}:${condition}:${stance}:${latest?.source ?? "none"}`;
  const monologue = lines[hash(lineKey) % lines.length];

  return {
    condition,
    stance,
    ...CONDITION_META[condition],
    monologue,
    videoFile: HERO_VIDEO_FILES[condition],
  };
}

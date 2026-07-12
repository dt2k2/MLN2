import { BAL } from "../balance";
import { adjustWage, buyMachine, layoffWorkers, sellMachine } from "../economy";
import type { EventOccurrence, GamePhase, GameState, TimedEffect } from "../types";
import { addOrRefreshEffect } from "./effects";
import type { Rng } from "./rng";

export interface EventDef {
  id: string;
  phase: GamePhase;
  once?: boolean;
  cooldown?: number;
  weight: number | ((state: GameState) => number);
  prerequisite?: (state: GameState) => boolean;
  build: (state: GameState) => EventOccurrence;
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const noChange = () => {};
const always = () => true;

function effect(
  state: GameState,
  id: string,
  source: string,
  kind: TimedEffect["kind"],
  value: number,
  remainingTurns: number,
) {
  state.activeEffects = addOrRefreshEffect(state.activeEffects, {
    id,
    source,
    kind,
    value,
    remainingTurns,
  });
}

export function getGamePhase(turn: number): GamePhase {
  if (turn <= 6) return 1;
  if (turn <= 12) return 2;
  if (turn <= 18) return 3;
  return 4;
}

export const EVENTS: EventDef[] = [
  {
    id: "defective-cloth",
    phase: 1,
    once: true,
    weight: 1,
    build: () => ({
      id: "defective-cloth",
      title: "Một lô vải kém chất lượng",
      description: "Thương nhân phát hiện đường dệt lỗi và yêu cầu xưởng chịu trách nhiệm.",
      choices: [
        {
          label: "Thu hồi và dệt lại",
          ownerStance: "pragmatic",
          tone: "accept",
          previewLabel: "Chi $2.000 · giữ uy tín",
          canChoose: (state) => state.cash >= 2_000,
          disabledReason: "Không đủ tiền mặt.",
          apply: (state) => {
            state.cash -= 2_000;
            state.unrest = clamp(state.unrest - 2);
          },
        },
        {
          label: "Bán hạ giá",
          ownerStance: "pragmatic",
          tone: "refuse",
          previewLabel: "Thu $1.000 · cầu quý sau −8%",
          apply: (state) => {
            state.cash += 1_000;
            effect(state, "quality-demand", "Vải kém chất lượng", "demandMultiplier", 0.92, 1);
          },
        },
      ],
    }),
  },
  {
    id: "wage-petition",
    phase: 1,
    once: true,
    weight: (state) => 0.8 + state.unrest / 100,
    build: () => ({
      id: "wage-petition",
      title: "Thỉnh nguyện tiền lương",
      description: "Đại diện công nhân đề nghị điều chỉnh lương theo giá lương thực.",
      choices: [
        {
          label: "Tăng lương 5%",
          ownerStance: "reformist",
          tone: "accept",
          previewLabel: "Lương +5% · bất ổn −7",
          apply: (state) => {
            adjustWage(state, 1.05);
            state.unrest = clamp(state.unrest - 7);
          },
        },
        {
          label: "Bác thỉnh nguyện",
          ownerStance: "coercive",
          tone: "refuse",
          previewLabel: "Bất ổn +7",
          apply: (state) => {
            state.unrest = clamp(state.unrest + 7);
          },
        },
      ],
    }),
  },
  {
    id: "military-order",
    phase: 1,
    once: true,
    weight: 0.8,
    build: () => ({
      id: "military-order",
      title: "Đơn hàng quân đội",
      description: "Nhà nước đặt mua vải đồng phục cho quý kế tiếp.",
      choices: [
        {
          label: "Nhận đơn hàng",
          ownerStance: "expansionist",
          tone: "accept",
          previewLabel: "Cầu quý sau +25% · sức khỏe −3",
          apply: (state) => {
            effect(state, "military-demand", "Đơn hàng quân đội", "demandMultiplier", 1.25, 1);
            state.health = clamp(state.health - 3);
          },
        },
        {
          label: "Giữ đơn hàng dân sự",
          ownerStance: "pragmatic",
          tone: "refuse",
          previewLabel: "Không đổi",
          apply: noChange,
        },
      ],
    }),
  },
  {
    id: "steam-sewing-machine",
    phase: 2,
    once: true,
    weight: 1,
    build: () => ({
      id: "steam-sewing-machine",
      title: "Máy may dẫn động hơi nước",
      description: "Một kỹ sư chào bán máy cải tiến tương thích với dây chuyền hiện có.",
      choices: [
        {
          label: "Mua máy với giá $12.000",
          ownerStance: "expansionist",
          tone: "accept",
          previewLabel: "Máy +1 · tiền mặt −$12.000",
          canChoose: (state) => state.cash >= 12_000,
          disabledReason: "Không đủ tiền mặt.",
          apply: (state) => {
            buyMachine(state, 12_000);
          },
        },
        {
          label: "Từ chối",
          tone: "refuse",
          ownerStance: "pragmatic",
          previewLabel: "Không đổi",
          apply: noChange,
        },
      ],
    }),
  },
  {
    id: "investigative-press",
    phase: 2,
    once: true,
    weight: (state) => 0.6 + state.unrest / 80,
    build: () => ({
      id: "investigative-press",
      title: "Báo chí điều tra xưởng máy",
      description: "Một phóng viên hỏi về tai nạn, giờ làm và khu nhà công nhân.",
      choices: [
        {
          label: "Cho phép thanh tra",
          ownerStance: "reformist",
          tone: "accept",
          previewLabel: "Chi $2.500 · sức khỏe +5 · mâu thuẫn −3",
          canChoose: (state) => state.cash >= 2_500,
          disabledReason: "Không đủ tiền mặt.",
          apply: (state) => {
            state.cash -= 2_500;
            state.health = clamp(state.health + 5);
            state.contradiction = clamp(state.contradiction - 3);
          },
        },
        {
          label: "Đóng cổng xưởng",
          ownerStance: "coercive",
          tone: "refuse",
          previewLabel: "Bất ổn +8 · mâu thuẫn +4",
          apply: (state) => {
            state.unrest = clamp(state.unrest + 8);
            state.contradiction = clamp(state.contradiction + 4);
          },
        },
      ],
    }),
  },
  {
    id: "cotton-shock",
    phase: 2,
    once: true,
    weight: 1,
    build: () => ({
      id: "cotton-shock",
      title: "Khủng hoảng bông",
      description: "Nguồn cung bông gián đoạn, đẩy giá nguyên liệu lên trong hai quý.",
      choices: [
        {
          label: "Mua hợp đồng bảo hiểm",
          ownerStance: "pragmatic",
          tone: "accept",
          previewLabel: "Chi $5.000 · nguyên liệu +10% trong 2 quý",
          canChoose: (state) => state.cash >= 5_000,
          disabledReason: "Không đủ tiền mặt.",
          apply: (state) => {
            state.cash -= 5_000;
            effect(state, "cotton-insured", "Khủng hoảng bông", "materialPriceMultiplier", 1.1, 2);
          },
        },
        {
          label: "Mua theo giá thị trường",
          ownerStance: "speculative",
          tone: "refuse",
          previewLabel: "Nguyên liệu +40% trong 2 quý",
          apply: (state) =>
            effect(state, "cotton-shock", "Khủng hoảng bông", "materialPriceMultiplier", 1.4, 2),
        },
      ],
    }),
  },
  {
    id: "union-founded",
    phase: 2,
    once: true,
    weight: (state) => 0.5 + state.unrest / 60,
    build: () => ({
      id: "union-founded",
      title: "Công đoàn được thành lập",
      description: "Công nhân lập quỹ tương trợ và cử đại diện thương lượng.",
      choices: [
        {
          label: "Công nhận đại diện",
          ownerStance: "reformist",
          tone: "accept",
          previewLabel: "Lương +3% · bất ổn −8",
          apply: (state) => {
            adjustWage(state, 1.03);
            state.unrest = clamp(state.unrest - 8);
          },
        },
        {
          label: "Sa thải ban tổ chức",
          ownerStance: "coercive",
          tone: "refuse",
          previewLabel: "4 người mất việc · mâu thuẫn +9",
          apply: (state) => {
            layoffWorkers(state, 4);
            state.contradiction = clamp(state.contradiction + 9);
          },
        },
      ],
    }),
  },
  {
    id: "factory-strike",
    phase: 3,
    once: true,
    weight: (state) => 0.3 + state.unrest / 35,
    prerequisite: (state) => state.unrest >= 45,
    build: () => ({
      id: "factory-strike",
      title: "Đình công toàn xưởng",
      description: "Sản xuất quý kế tiếp bị đe dọa; số hàng trong kho không tự biến mất.",
      choices: [
        {
          label: "Thương lượng",
          ownerStance: "reformist",
          tone: "accept",
          previewLabel: "Lương +7% · sản lượng quý sau −20%",
          apply: (state) => {
            adjustWage(state, 1.07);
            state.unrest = clamp(state.unrest - 14);
            effect(state, "negotiated-strike", "Đình công", "outputMultiplier", 0.8, 1);
          },
        },
        {
          label: "Đối đầu",
          ownerStance: "coercive",
          tone: "refuse",
          previewLabel: "Sản lượng quý sau −55% · mâu thuẫn +10",
          apply: (state) => {
            state.contradiction = clamp(state.contradiction + 10);
            effect(state, "factory-strike", "Đình công", "outputMultiplier", 0.45, 1);
          },
        },
      ],
    }),
  },
  {
    id: "factory-act",
    phase: 3,
    once: true,
    weight: 1,
    build: () => ({
      id: "factory-act",
      title: "Luật Xưởng máy",
      description: "Nghị viện áp trần ngày lao động 12 giờ; tranh luận chỉ còn về cách thi hành.",
      choices: [
        {
          label: "Thi hành và cải thiện an toàn",
          ownerStance: "reformist",
          tone: "accept",
          previewLabel: "Trần 12 giờ · chi $3.000 · sức khỏe +6",
          canChoose: (state) => state.cash >= 3_000,
          disabledReason: "Không đủ tiền cho cải thiện an toàn.",
          apply: (state) => {
            state.cash -= 3_000;
            state.legalMaxWorkHours = 12;
            state.workHours = Math.min(state.workHours, 12);
            state.health = clamp(state.health + 6);
          },
        },
        {
          label: "Chỉ tuân thủ tối thiểu",
          ownerStance: "coercive",
          tone: "refuse",
          previewLabel: "Trần 12 giờ · bất ổn +3",
          apply: (state) => {
            state.legalMaxWorkHours = 12;
            state.workHours = Math.min(state.workHours, 12);
            state.unrest = clamp(state.unrest + 3);
          },
        },
      ],
    }),
  },
  {
    id: "krupp-price-war",
    phase: 3,
    once: true,
    weight: 1,
    build: () => ({
      id: "krupp-price-war",
      title: "Krupp phát động chiến tranh giá",
      description: "Quy mô lớn cho phép Krupp hạ giá để giành đơn hàng trong hai quý.",
      choices: [
        {
          label: "Hạ giá cạnh tranh",
          ownerStance: "speculative",
          tone: "accept",
          previewLabel: "Cầu của xưởng −10% trong 2 quý",
          apply: (state) =>
            effect(state, "price-war-match", "Chiến tranh giá", "demandMultiplier", 0.9, 2),
        },
        {
          label: "Giữ biên lợi nhuận",
          ownerStance: "pragmatic",
          tone: "refuse",
          previewLabel: "Cầu của xưởng −25% trong 2 quý",
          apply: (state) =>
            effect(state, "price-war", "Chiến tranh giá", "demandMultiplier", 0.75, 2),
        },
      ],
    }),
  },
  {
    id: "credit-crisis-1857",
    phase: 4,
    once: true,
    weight: 1.5,
    prerequisite: (state) => state.year >= 1857 && state.debt > 0,
    build: (state) => {
      const demanded = Math.min(8_000, state.debt);
      return {
        id: "credit-crisis-1857",
        title: "Khủng hoảng tín dụng 1857",
        description: `Ngân hàng đòi thu hồi $${demanded.toLocaleString("en-US")} gốc vay giữa cơn hoảng loạn.`,
        choices: [
          {
            label: "Bán máy và trả nợ",
            ownerStance: "pragmatic",
            tone: "accept",
            previewLabel: `Máy −1 · nợ −$${demanded.toLocaleString("en-US")}`,
            canChoose: (current) =>
              current.machines > 1 && current.cash + BAL.machineLiquidationValue >= demanded,
            disabledReason: "Không đủ máy hoặc tiền sau thanh lý.",
            apply: (current) => {
              sellMachine(current);
              current.cash -= demanded;
              current.debt -= demanded;
            },
          },
          {
            label: "Tái cơ cấu khoản vay",
            ownerStance: "speculative",
            tone: "refuse",
            previewLabel: "Nợ +$2.000 · lãi suất gấp đôi trong 2 quý",
            apply: (current) => {
              current.debt += 2_000;
              effect(
                current,
                "penalty-interest",
                "Tái cơ cấu 1857",
                "interestRateMultiplier",
                2,
                2,
              );
            },
          },
        ],
      };
    },
  },
  {
    id: "krupp-merger",
    phase: 4,
    once: true,
    weight: 0.8,
    prerequisite: (state) => state.marketShare < 0.28,
    build: () => ({
      id: "krupp-merger",
      title: "Krupp đề nghị sáp nhập",
      description: "Đối thủ muốn mua quyền kiểm soát xưởng và hợp nhất đơn hàng.",
      choices: [
        {
          label: "Chấp nhận sáp nhập",
          ownerStance: "speculative",
          tone: "accept",
          previewLabel: "Kết thúc: tập trung tư bản",
          apply: (state) => {
            state.ending = "monopoly";
          },
        },
        {
          label: "Giữ độc lập",
          ownerStance: "pragmatic",
          tone: "refuse",
          previewLabel: "Cầu −15% trong 2 quý",
          apply: (state) =>
            effect(state, "merger-refusal", "Từ chối Krupp", "demandMultiplier", 0.85, 2),
        },
      ],
    }),
  },
  {
    id: "overproduction-panic",
    phase: 4,
    once: true,
    weight: 1.5,
    prerequisite: (state) =>
      state.industrySupply > state.effectiveDemand &&
      state.inventory > state.demand * BAL.inventoryCrisisRatio,
    build: () => ({
      id: "overproduction-panic",
      title: "Hoảng loạn sản xuất thừa",
      description: "Kho hàng cao, cung ngành vượt cầu và tín dụng co lại cùng lúc.",
      choices: [
        {
          label: "Cắt sản xuất có kế hoạch",
          ownerStance: "pragmatic",
          tone: "accept",
          previewLabel: "Sản lượng −30% trong 2 quý · cầu ổn định hơn",
          apply: (state) =>
            effect(
              state,
              "planned-cutback",
              "Hoảng loạn sản xuất thừa",
              "outputMultiplier",
              0.7,
              2,
            ),
        },
        {
          label: "Tiếp tục tranh thị phần",
          ownerStance: "expansionist",
          tone: "refuse",
          previewLabel: "Cầu −25% trong 2 quý · mâu thuẫn +6",
          apply: (state) => {
            effect(state, "panic-demand", "Hoảng loạn sản xuất thừa", "demandMultiplier", 0.75, 2);
            state.contradiction = clamp(state.contradiction + 6);
          },
        },
      ],
    }),
  },
  {
    id: "workers-district-riot",
    phase: 4,
    once: true,
    weight: (state) => 0.5 + state.unrest / 40,
    prerequisite: (state) => state.unrest >= 65,
    build: () => ({
      id: "workers-district-riot",
      title: "Bạo loạn khu công nhân",
      description: "Giá lương thực, thất nghiệp và xung đột với cảnh sát làm khu lao động bùng nổ.",
      choices: [
        {
          label: "Mở quỹ cứu trợ",
          ownerStance: "reformist",
          tone: "accept",
          previewLabel: "Chi $6.000 · bất ổn −15",
          canChoose: (state) => state.cash >= 6_000,
          disabledReason: "Không đủ tiền mặt.",
          apply: (state) => {
            state.cash -= 6_000;
            state.unrest = clamp(state.unrest - 15);
          },
        },
        {
          label: "Yêu cầu trấn áp",
          ownerStance: "coercive",
          tone: "refuse",
          previewLabel: "Bất ổn +10 · mâu thuẫn +12",
          apply: (state) => {
            state.unrest = clamp(state.unrest + 10);
            state.contradiction = clamp(state.contradiction + 12);
          },
        },
      ],
    }),
  },
];

export function eligibleEvents(state: GameState): EventDef[] {
  const phase = getGamePhase(state.turn);
  return EVENTS.filter((event) => {
    if (event.phase !== phase || (event.prerequisite && !event.prerequisite(state))) {
      return false;
    }
    const history = state.eventHistory[event.id];
    if (!history) return true;
    if (event.once) return false;
    return state.turn - history.lastTurn > (event.cooldown ?? 0);
  });
}

export function rollEvent(state: GameState, rng: Rng): EventOccurrence | null {
  if (rng() > BAL.eventChance) return null;
  const eligible = eligibleEvents(state);
  if (eligible.length === 0) return null;

  const weighted = eligible.map((event) => ({
    event,
    weight: typeof event.weight === "function" ? Math.max(0, event.weight(state)) : event.weight,
  }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return null;

  let pick = rng() * total;
  const selected =
    weighted.find((item) => {
      pick -= item.weight;
      return pick <= 0;
    })?.event ?? weighted[weighted.length - 1].event;
  const previous = state.eventHistory[selected.id];
  state.eventHistory[selected.id] = {
    count: (previous?.count ?? 0) + 1,
    lastTurn: state.turn,
  };
  const occurrence = selected.build(state);
  if (!occurrence.choices.some((choice) => (choice.canChoose ?? always)(state))) {
    throw new Error(`Event ${selected.id} has no valid choice`);
  }
  return occurrence;
}

import { BAL } from "./balance";
import { adjustWage, buyMachine, hireWorkers, layoffWorkers, sellMachine } from "./economy";
import { effectiveWorkHoursCap } from "./engine/effects";
import type { DecisionGroupId, DecisionOptionId, GameState, OwnerStance } from "./types";

export interface DecisionOption {
  id: DecisionOptionId;
  groupId: DecisionGroupId;
  label: string;
  description: string;
  canApply: (state: GameState) => boolean;
  disabledReason: (state: GameState) => string;
  apply: (state: GameState) => void;
  ownerStance?: OwnerStance | ((previous: GameState, next: GameState) => OwnerStance);
}

const allowed = () => true;
const noReason = () => "";

export const DECISION_GROUPS: {
  id: DecisionGroupId;
  title: string;
  options: DecisionOptionId[];
}[] = [
  { id: "WORKDAY", title: "Ngày lao động", options: ["REDUCE_HOURS", "EXTEND_HOURS"] },
  { id: "WAGES", title: "Tiền lương", options: ["RAISE_WAGE", "CUT_WAGE"] },
  { id: "STAFFING", title: "Nhân sự", options: ["HIRE_WORKERS", "LAYOFF"] },
  { id: "MACHINERY", title: "Máy móc", options: ["BUY_MACHINE", "SELL_MACHINE"] },
  {
    id: "ACCUMULATION",
    title: "Tích lũy",
    options: ["REINVEST_25", "REINVEST_50", "REINVEST_75", "REINVEST_100"],
  },
  {
    id: "CREDIT",
    title: "Tín dụng",
    options: ["BORROW", "REPAY_5000", "REPAY_15000", "REPAY_ALL"],
  },
];

function repaymentOption(
  id: "REPAY_5000" | "REPAY_15000" | "REPAY_ALL",
  amount: number | "all",
): DecisionOption {
  const payment = (state: GameState) =>
    amount === "all" ? state.debt : Math.min(amount, state.debt);
  return {
    id,
    groupId: "CREDIT",
    label: amount === "all" ? "Tất toán" : `Trả $${amount.toLocaleString("en-US")}`,
    description: "Giảm dư nợ gốc; lãi quý sau giảm theo.",
    canApply: (state) => state.debt > 0 && state.cash >= payment(state),
    disabledReason: (state) =>
      state.debt <= 0 ? "Doanh nghiệp chưa có nợ." : "Tiền mặt không đủ để trả khoản này.",
    apply: (state) => {
      const paid = payment(state);
      state.cash -= paid;
      state.debt -= paid;
    },
    ownerStance: "pragmatic",
  };
}

function reinvestmentOption(
  id: "REINVEST_25" | "REINVEST_50" | "REINVEST_75" | "REINVEST_100",
  rate: number,
): DecisionOption {
  return {
    id,
    groupId: "ACCUMULATION",
    label: `Giữ lại ${rate * 100}%`,
    description: "Giữ phần lợi nhuận này trong quỹ tích lũy từ cuối quý.",
    canApply: (state) => Math.abs(state.reinvestmentRate - rate) > 0.0001,
    disabledReason: () => "Đây là tỷ lệ giữ lại đang áp dụng.",
    apply: (state) => {
      state.reinvestmentRate = rate;
    },
    ownerStance: (previous, next) =>
      next.reinvestmentRate > previous.reinvestmentRate ? "expansionist" : "pragmatic",
  };
}

export const DECISIONS: Record<DecisionOptionId, DecisionOption> = {
  REDUCE_HOURS: {
    id: "REDUCE_HOURS",
    groupId: "WORKDAY",
    label: "Giảm 2 giờ",
    description: "Giảm sản lượng tức thời nhưng cải thiện sức khỏe và bất ổn.",
    canApply: (state) => state.workHours - 2 >= BAL.minWorkHours,
    disabledReason: () => `Ngày lao động không thể thấp hơn ${BAL.minWorkHours} giờ.`,
    apply: (state) => {
      state.workHours -= 2;
      state.health = Math.min(100, state.health + 5);
      state.unrest = Math.max(0, state.unrest - 4);
    },
    ownerStance: "reformist",
  },
  EXTEND_HOURS: {
    id: "EXTEND_HOURS",
    groupId: "WORKDAY",
    label: "Tăng 2 giờ",
    description: "Tăng lao động sống trong quý, đồng thời tăng hao mòn và bất ổn.",
    canApply: (state) =>
      state.workHours + 2 <= Math.min(BAL.maxWorkHours, effectiveWorkHoursCap(state)),
    disabledReason: (state) =>
      `Giới hạn hiện hành là ${Math.min(BAL.maxWorkHours, effectiveWorkHoursCap(state))} giờ.`,
    apply: (state) => {
      state.workHours += 2;
      state.health = Math.max(0, state.health - 4);
      state.unrest = Math.min(100, state.unrest + 5);
    },
    ownerStance: "coercive",
  },
  RAISE_WAGE: {
    id: "RAISE_WAGE",
    groupId: "WAGES",
    label: "Tăng lương 10%",
    description: "Tăng tư bản khả biến và sức mua, giảm bất ổn.",
    canApply: allowed,
    disabledReason: noReason,
    apply: (state) => {
      adjustWage(state, 1.1);
      state.health = Math.min(100, state.health + 3);
      state.unrest = Math.max(0, state.unrest - 5);
    },
    ownerStance: "reformist",
  },
  CUT_WAGE: {
    id: "CUT_WAGE",
    groupId: "WAGES",
    label: "Giảm lương 10%",
    description: "Giảm chi phí tiền lương nhưng làm suy yếu sức mua và kỷ luật lao động.",
    canApply: (state) => state.wagePerWorker * 0.9 >= 120,
    disabledReason: () => "Tiền lương đã chạm mức sinh tồn tối thiểu.",
    apply: (state) => {
      adjustWage(state, 0.9);
      state.health = Math.max(0, state.health - 3);
      state.unrest = Math.min(100, state.unrest + 6);
    },
    ownerStance: "coercive",
  },
  HIRE_WORKERS: {
    id: "HIRE_WORKERS",
    groupId: "STAFFING",
    label: `Tuyển ${BAL.staffingUnit} người`,
    description: "Ưu tiên gọi lao động nhàn rỗi trở lại xưởng.",
    canApply: allowed,
    disabledReason: noReason,
    apply: (state) => {
      hireWorkers(state, BAL.staffingUnit);
    },
    ownerStance: "reformist",
  },
  LAYOFF: {
    id: "LAYOFF",
    groupId: "STAFFING",
    label: `Sa thải ${BAL.staffingUnit} người`,
    description: "Giảm quỹ lương nhưng mở rộng đội quân lao động dự bị.",
    canApply: (state) => state.workersActive - BAL.staffingUnit >= BAL.minimumWorkers,
    disabledReason: () => `Xưởng cần ít nhất ${BAL.minimumWorkers} lao động.`,
    apply: (state) => {
      layoffWorkers(state, BAL.staffingUnit);
      state.unrest = Math.min(100, state.unrest + 8);
    },
    ownerStance: "coercive",
  },
  BUY_MACHINE: {
    id: "BUY_MACHINE",
    groupId: "MACHINERY",
    label: "Mua một máy",
    description: "Tăng năng suất; máy chuyển giá trị của nó vào hàng hóa qua khấu hao.",
    canApply: (state) => state.cash >= BAL.machinePrice,
    disabledReason: () => "Tiền mặt không đủ; hãy dùng quyết định Tín dụng trước.",
    apply: (state) => {
      buyMachine(state);
    },
    ownerStance: "expansionist",
  },
  SELL_MACHINE: {
    id: "SELL_MACHINE",
    groupId: "MACHINERY",
    label: "Bán một máy",
    description: `Thu hồi $${BAL.machineLiquidationValue.toLocaleString("en-US")} giá thanh lý.`,
    canApply: (state) => state.machines > 1,
    disabledReason: () => "Phải giữ ít nhất một máy để sản xuất.",
    apply: (state) => {
      sellMachine(state);
    },
    ownerStance: "pragmatic",
  },
  REINVEST_25: reinvestmentOption("REINVEST_25", 0.25),
  REINVEST_50: reinvestmentOption("REINVEST_50", 0.5),
  REINVEST_75: reinvestmentOption("REINVEST_75", 0.75),
  REINVEST_100: reinvestmentOption("REINVEST_100", 1),
  BORROW: {
    id: "BORROW",
    groupId: "CREDIT",
    label: `Vay $${BAL.loanUnit.toLocaleString("en-US")}`,
    description: `Nhận vốn vay; lãi suất chuẩn ${BAL.annualLoanRate * 100}%/năm, trả theo quý.`,
    canApply: (state) => state.debt + BAL.loanUnit <= BAL.maxDebt,
    disabledReason: () => `Khoản vay mới sẽ vượt trần nợ $${BAL.maxDebt.toLocaleString("en-US")}.`,
    apply: (state) => {
      state.cash += BAL.loanUnit;
      state.debt += BAL.loanUnit;
    },
    ownerStance: "speculative",
  },
  REPAY_5000: repaymentOption("REPAY_5000", 5_000),
  REPAY_15000: repaymentOption("REPAY_15000", 15_000),
  REPAY_ALL: repaymentOption("REPAY_ALL", "all"),
};

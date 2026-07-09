import { BAL } from "./balance";
import type { ActionId, GameState } from "./types";

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

export interface ActionMeta {
  id: ActionId;
  title: string;
  description: string;
  cost: (s: GameState) => number;
  canApply: (s: GameState) => boolean;
  apply: (s: GameState) => void;
  preview: (s: GameState) => { label: string; value: string; tone: "up" | "down" | "warn" }[];
}

export const ACTIONS: Record<ActionId, ActionMeta> = {
  EXTEND_HOURS: {
    id: "EXTEND_HOURS",
    title: "Tăng giờ làm việc",
    description: "Kéo dài ngày lao động thêm 2 giờ.",
    cost: () => 0,
    canApply: (s) => s.workHours < BAL.maxWorkHours,
    apply: (s) => {
      s.workHours = Math.min(BAL.maxWorkHours, s.workHours + 2);
      s.unrest = clamp(s.unrest + 6);
    },
    preview: (s) => [
      { label: "Giờ", value: `→${Math.min(BAL.maxWorkHours, s.workHours + 2)}h`, tone: "up" },
      { label: "Sức khoẻ", value: "−", tone: "down" },
      { label: "Mâu thuẫn", value: "+", tone: "warn" },
    ],
  },
  RAISE_WAGE: {
    id: "RAISE_WAGE",
    title: "Nâng tiền lương",
    description: "Tăng v 10% để xoa dịu công nhân.",
    cost: (s) => Math.round(s.workersActive * s.wagePerWorker * 0.1),
    canApply: () => true,
    apply: (s) => {
      s.wagePerWorker = Math.round(s.wagePerWorker * 1.1);
      s.unrest = clamp(s.unrest - 8);
    },
    preview: () => [
      { label: "Tinh thần", value: "+", tone: "up" },
      { label: "p′", value: "−", tone: "down" },
    ],
  },
  BUY_MACHINE: {
    id: "BUY_MACHINE",
    title: "Mua máy móc",
    description: "Tăng năng suất, tăng c (cấu tạo hữu cơ tăng).",
    cost: () => BAL.machinePrice,
    canApply: (s) => s.cash + s.debt < 200000,
    apply: (s) => {
      s.cash -= BAL.machinePrice;
      s.machines += 1;
    },
    preview: () => [
      { label: "Sản lượng", value: "+", tone: "up" },
      { label: "c/v", value: "↑", tone: "warn" },
    ],
  },
  EXPAND_FACTORY: {
    id: "EXPAND_FACTORY",
    title: "Mở rộng xưởng",
    description: "Xây phân xưởng mới, +20 công nhân.",
    cost: () => 32000,
    canApply: () => true,
    apply: (s) => {
      s.cash -= 32000;
      s.workersActive += 20;
      s.machines += 2;
    },
    preview: () => [
      { label: "Quy mô", value: "+40%", tone: "up" },
      { label: "Rủi ro", value: "+", tone: "warn" },
    ],
  },
  LAYOFF: {
    id: "LAYOFF",
    title: "Cắt giảm nhân công",
    description: "Sa thải 8 công nhân.",
    cost: () => 0,
    canApply: (s) => s.workersActive > 10,
    apply: (s) => {
      const n = Math.min(8, s.workersActive - 5);
      s.workersActive -= n;
      s.workersIdle += n;
      s.unrest = clamp(s.unrest + n * 1.5);
      s.contradiction = clamp(s.contradiction + 2);
    },
    preview: () => [
      { label: "v", value: "−", tone: "up" },
      { label: "Mâu thuẫn", value: "+", tone: "warn" },
    ],
  },
  BORROW: {
    id: "BORROW",
    title: "Vay tư bản",
    description: `Vay ngân hàng ${BAL.loanRate * 100}% / quý.`,
    cost: () => 0,
    canApply: (s) => s.debt < 100000,
    apply: (s) => {
      s.cash += BAL.loanUnit;
      s.debt += BAL.loanUnit;
    },
    preview: () => [
      { label: "Tiền mặt", value: `+$${(BAL.loanUnit / 1000).toFixed(0)}k`, tone: "up" },
      { label: "Nợ", value: "+", tone: "down" },
    ],
  },
};

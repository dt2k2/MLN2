import { BAL } from "../balance";
import type { GameState, QuarterRecord } from "../types";

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

export function productivityPerWorker(machines: number, workersActive: number, health: number) {
  // Mỗi máy tăng năng suất, nhưng giảm dần khi thiếu người vận hành
  const machineCoverage = Math.min(1, (machines * 4) / Math.max(1, workersActive));
  const healthFactor = 0.5 + health / 200; // 0.5 – 1.0
  return (1 + machineCoverage * 1.2) * healthFactor;
}

export function computeQuarter(s: GameState): QuarterRecord {
  const workers = s.workersActive;
  const hours = s.workHours;

  // 1. Sản xuất
  const perWorker = productivityPerWorker(s.machines, workers, s.health);
  const rawCapacity = s.machines * BAL.machineCapacity + workers * 8;
  const laborOutput = workers * perWorker * (hours / 8) * 12; // đvsp/quý
  const output = Math.max(0, Math.min(rawCapacity, laborOutput));

  // 2. c: khấu hao + nguyên liệu
  const depreciation = s.machines * BAL.machinePrice * BAL.machineDepreciation;
  const materialCost = output * BAL.unitMaterial * s.materialPrice;
  const c = depreciation + materialCost;

  // 3. v: tiền lương (giờ dài hơn tính tăng ca nhẹ)
  const overtimeFactor = hours > 8 ? 1 + (hours - 8) * 0.06 : 1;
  const v = workers * s.wagePerWorker * overtimeFactor;

  // 4. Giá trị mới V' (chỉ lao động sống tạo ra)
  const healthEff = 0.6 + s.health / 250;
  const Vnew = workers * hours * 12 * BAL.valuePerLaborHour * healthEff * (perWorker / 1.8);

  // 5. m
  const m = Math.max(0, Vnew - v);

  // 6–7. Doanh thu: bán theo giá trị xã hội (sellPrice do market quy định)
  const salable = output + s.inventory;
  const sold = Math.min(salable, s.demand);
  const W = sold * s.sellPrice;
  const inventoryNext = Math.max(0, salable - sold);

  // 8. Lợi nhuận thực tế
  const interest = s.debt * BAL.loanRate;
  const profit = W - c - v - interest;

  const organic = v > 0 ? c / v : 0;
  const exploitation = v > 0 ? m / v : 0;
  const profitRate = c + v > 0 ? m / (c + v) : 0;
  const profitRateReal = c + v > 0 ? profit / (c + v) : 0;

  return {
    turn: s.turn,
    year: s.year,
    quarter: s.quarter,
    c, v, m, W, profit,
    profitRate, profitRateReal,
    exploitation, organic,
    contradiction: s.contradiction,
    unrest: s.unrest,
    health: s.health,
    output, demand: s.demand,
    inventory: inventoryNext,
    sellPrice: s.sellPrice,
    materialPrice: s.materialPrice,
  };
}

export function applySocialUpdate(s: GameState, rec: QuarterRecord) {
  // Sức khoẻ
  const strain = Math.max(0, s.workHours - 8) * BAL.strainPerHourAbove8;
  const recovery = Math.max(0, (s.wagePerWorker - BAL.baseWagePerWorker)) * BAL.recoveryFromWage;
  s.health = clamp(s.health + recovery - strain + 1); // +1 baseline hồi phục

  // Unrest ngắn hạn
  const longHours = Math.max(0, s.workHours - 10) * BAL.unrestFromLongHours;
  const wagePremium = (s.wagePerWorker - BAL.baseWagePerWorker) / BAL.baseWagePerWorker;
  const relief = Math.max(0, wagePremium * 100) * BAL.unrestReliefFromRaise * 0.3;
  const healthDrag = s.health < 50 ? (50 - s.health) * 0.15 : 0;
  s.unrest = clamp(s.unrest + longHours + healthDrag - relief - 0.5);

  // Contradiction dài hạn (chỉ dâng, rất khó hạ)
  s.contradiction = clamp(s.contradiction + s.unrest * BAL.contradictionPerUnrest * 0.1);

  // Overstock streak
  if (rec.inventory > 2 * s.demand) s.overstockStreak += 1;
  else s.overstockStreak = 0;

  // Debt stress
  if (s.debt > BAL.bankruptcyDebtRatio * Math.max(1, s.cash + s.machines * BAL.machinePrice)) {
    s.debtStressStreak += 1;
  } else {
    s.debtStressStreak = 0;
  }
}

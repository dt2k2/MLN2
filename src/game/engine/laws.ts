import { BAL } from "../balance";
import type { GameState, QuarterRecord } from "../types";
import { effectMultiplier } from "./effects";

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

export function productivityPerWorker(machines: number, workersActive: number, health: number) {
  const machineCoverage = Math.min(1, (machines * 4) / Math.max(1, workersActive));
  const healthFactor = 0.78 + health / 400;
  return (1 + machineCoverage * 1.2) * healthFactor;
}

export function computeQuarter(s: GameState): QuarterRecord {
  const workers = s.workersActive;
  const hours = s.workHours;
  const outputEffect = effectMultiplier(s, "outputMultiplier");
  const demandEffect = effectMultiplier(s, "demandMultiplier");
  const materialEffect = effectMultiplier(s, "materialPriceMultiplier");
  const interestEffect = effectMultiplier(s, "interestRateMultiplier");

  const perWorker = productivityPerWorker(s.machines, workers, s.health);
  const rawCapacity = s.machines * BAL.machineCapacity + workers * 8;
  const laborOutput = workers * perWorker * (hours / 8) * 12;
  const output = Math.max(0, Math.min(rawCapacity, laborOutput) * outputEffect);
  const laborHours = workers * hours * 12;
  const laborProductivity = laborHours > 0 ? output / laborHours : 0;
  const individualLaborTime = output > 0 ? laborHours / output : 0;
  const socialLaborTime = BAL.baseSocialLaborTime / s.industryProductivity;

  const depreciation = s.machines * BAL.machinePrice * BAL.machineDepreciation;
  const materialCost = output * BAL.unitMaterial * s.materialPrice * materialEffect;
  const c = depreciation + materialCost;

  const overtimeFactor = hours > 8 ? 1 + (hours - 8) * 0.06 : 1;
  const v = workers * s.wagePerWorker * overtimeFactor;

  // Only living labour creates new value. Machinery changes productivity and
  // transfers its own value through depreciation; it does not create value.
  const laborIntensity = 0.9 + s.health / 800;
  const newValue = laborHours * BAL.valuePerLaborHour * laborIntensity;
  const baseSurplusValue = Math.max(0, newValue - v);
  const extraSurplusValue =
    output * Math.max(0, socialLaborTime - individualLaborTime) * BAL.valuePerLaborHour;
  const m = baseSurplusValue + extraSurplusValue;

  const quarterDemand = s.demand * demandEffect;
  const effectiveDemand = s.effectiveDemand * demandEffect;
  const salable = output + s.inventory;
  const sold = Math.min(salable, quarterDemand);
  const W = sold * s.sellPrice;
  const inventoryNext = Math.max(0, salable - sold);
  const interestPaid = s.debt * BAL.quarterlyLoanRate * interestEffect;
  const profit = W - c - v - interestPaid;
  const reinvestedProfit = profit > 0 ? profit * s.reinvestmentRate : profit;
  const ownerConsumption = profit > 0 ? profit - reinvestedProfit : 0;

  const organic = v > 0 ? c / v : 0;
  const exploitation = v > 0 ? m / v : 0;
  const profitRate = c + v > 0 ? m / (c + v) : 0;
  const profitRateReal = c + v > 0 ? profit / (c + v) : 0;
  const productiveAssets =
    Math.max(0, s.cash) +
    s.machines * BAL.machinePrice +
    s.inventory * Math.max(1, s.sellPrice * 0.6);

  return {
    turn: s.turn,
    year: s.year,
    quarter: s.quarter,
    c,
    v,
    m,
    newValue,
    baseSurplusValue,
    extraSurplusValue,
    W,
    profit,
    reinvestedProfit,
    ownerConsumption,
    interestPaid,
    debtRatio: s.debt / Math.max(1, productiveAssets),
    profitRate,
    profitRateReal,
    exploitation,
    organic,
    contradiction: s.contradiction,
    unrest: s.unrest,
    health: s.health,
    output,
    demand: quarterDemand,
    effectiveDemand,
    industrySupply: s.industrySupply,
    inventory: inventoryNext,
    sellPrice: s.sellPrice,
    materialPrice: s.materialPrice * materialEffect,
    laborProductivity,
    individualLaborTime,
    socialLaborTime,
  };
}

export function applySocialUpdate(s: GameState, rec: QuarterRecord) {
  const strain = Math.max(0, s.workHours - 8) * BAL.strainPerHourAbove8;
  const recovery = Math.max(0, s.wagePerWorker - BAL.baseWagePerWorker) * BAL.recoveryFromWage;
  s.health = clamp(s.health + recovery - strain + 1);

  const longHours = Math.max(0, s.workHours - 10) * BAL.unrestFromLongHours;
  const wagePremium = (s.wagePerWorker - BAL.baseWagePerWorker) / BAL.baseWagePerWorker;
  const relief = Math.max(0, wagePremium * 100) * BAL.unrestReliefFromRaise * 0.3;
  const healthDrag = s.health < 50 ? (50 - s.health) * 0.15 : 0;
  const employmentRelief = Math.max(0, 12 - s.socialUnemployment) * 0.08;
  s.unrest = clamp(s.unrest + longHours + healthDrag - relief - employmentRelief - 0.4);

  const conflictPressure =
    s.unrest * BAL.contradictionPerUnrest * 0.075 +
    Math.max(0, rec.exploitation - 1) * 0.6 +
    Math.max(0, rec.industrySupply / Math.max(1, rec.effectiveDemand) - 1) * 1.5;
  const reformRelief = s.workHours <= 8 && wagePremium > 0 ? 0.8 : 0;
  s.contradiction = clamp(s.contradiction + conflictPressure - reformRelief);

  const inventoryRatio = rec.inventory / Math.max(1, rec.demand);
  const industryOverproduction = rec.industrySupply > rec.effectiveDemand;
  s.overstockStreak =
    industryOverproduction && inventoryRatio > BAL.inventoryCrisisRatio ? s.overstockStreak + 1 : 0;

  s.debtStressStreak = rec.debtRatio > BAL.bankruptcyDebtRatio ? s.debtStressStreak + 1 : 0;

  const wageIndex = s.wagePerWorker / BAL.baseWagePerWorker;
  s.purchasingPowerIndex = Math.max(
    0.72,
    Math.min(1.12, 1 + (wageIndex - 1) * 0.2 - (s.socialUnemployment - 10) * 0.006),
  );

  rec.contradiction = s.contradiction;
  rec.unrest = s.unrest;
  rec.health = s.health;
}

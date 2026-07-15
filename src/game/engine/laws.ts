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
  const socialLaborTime = BAL.baseSocialLaborTime / Math.max(0.01, s.industryProductivity);

  const materialCost = output * BAL.unitMaterial * s.materialPrice * materialEffect;
  const depreciation = Math.min(s.machineBookValue, s.machineBookValue * BAL.machineDepreciation);
  const cTransferred = materialCost + depreciation;
  const v = workers * s.wagePerWorker;

  // Living labour alone creates new value. Labour slower than the social norm
  // is not fully validated as abstract social labour.
  const laborIntensity = 0.9 + s.health / 800;
  const effectiveLaborHours = laborHours * laborIntensity;
  const validatedLaborHours = Math.min(effectiveLaborHours, output * socialLaborTime);
  const newValue = validatedLaborHours * BAL.valuePerLaborHour;
  const reproducedVariableCapital = Math.min(v, newValue);
  const unrecoveredVariableCapital = Math.max(0, v - newValue);
  const m = Math.max(0, newValue - v);
  const necessaryLaborTime = Math.min(validatedLaborHours, v / BAL.valuePerLaborHour);
  const surplusLaborTime = Math.max(0, validatedLaborHours - necessaryLaborTime);
  const commodityValue = cTransferred + newValue;

  const quarterDemand = s.demand * demandEffect;
  const effectiveDemand = s.effectiveDemand * demandEffect;
  const salable = output + s.inventory;
  const sold = Math.min(salable, quarterDemand);
  const revenue = sold * s.sellPrice;
  const inventoryNext = Math.max(0, salable - sold);
  const extraProfit =
    sold * Math.max(0, socialLaborTime - individualLaborTime) * BAL.valuePerLaborHour;
  const interestPaid = s.debt * BAL.quarterlyLoanRate * interestEffect;
  const operatingCashFlow = revenue - materialCost - v - interestPaid;
  const accountingProfit = operatingCashFlow - depreciation;
  const retainedProfit = accountingProfit > 0 ? accountingProfit * s.reinvestmentRate : 0;
  const ownerConsumption = accountingProfit > 0 ? accountingProfit - retainedProfit : 0;

  const constantCapitalAdvanced = s.machineBookValue + materialCost;
  const totalCapitalAdvanced = constantCapitalAdvanced + v;
  const organic = v > 0 ? constantCapitalAdvanced / v : 0;
  const exploitation = v > 0 ? m / v : 0;
  const profitRate = totalCapitalAdvanced > 0 ? m / totalCapitalAdvanced : 0;
  const profitRateReal = totalCapitalAdvanced > 0 ? accountingProfit / totalCapitalAdvanced : 0;
  const productiveAssets =
    Math.max(0, s.cash) + s.machineBookValue + s.inventory * BAL.unitMaterial * s.materialPrice;

  return {
    turn: s.turn,
    year: s.year,
    quarter: s.quarter,
    cTransferred,
    v,
    m,
    newValue,
    reproducedVariableCapital,
    unrecoveredVariableCapital,
    effectiveLaborHours,
    validatedLaborHours,
    necessaryLaborTime,
    surplusLaborTime,
    extraProfit,
    commodityValue,
    revenue,
    materialCost,
    depreciation,
    machineBookValue: s.machineBookValue,
    constantCapitalAdvanced,
    totalCapitalAdvanced,
    operatingCashFlow,
    accountingProfit,
    retainedProfit,
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
    machines: s.machines,
    machinesAtTurnStart: s.machinesAtTurnStart,
    workHoursAtTurnStart: s.workHoursAtTurnStart,
    laborProductivityAtTurnStart: s.laborProductivityAtTurnStart,
    capitalizedAccumulation: s.capitalizedAccumulationThisTurn,
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

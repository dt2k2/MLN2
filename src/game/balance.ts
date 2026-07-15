// Central balance constants — tinh chỉnh ở đây, không đụng logic.
export const BAL = {
  maxTurns: 24,
  startYear: 1852,
  startQuarter: 1,
  initialSeed: 1852,

  // Di sản mở đầu của xưởng
  initialCash: 60_000,
  initialDebt: 15_000,
  initialMachines: 3,
  initialActiveWorkers: 32,
  initialIdleWorkers: 8,
  initialInventory: 200,

  // Lao động
  baseWagePerWorker: 220, // $/quý ở 8h
  baseWorkHours: 10, // giờ/ngày
  minWorkHours: 6,
  maxWorkHours: 16,
  staffingUnit: 8,
  minimumWorkers: 8,
  valuePerLaborHour: 3.4, // biểu hiện tiền tệ của 1 giờ lao động xã hội

  // Máy móc
  machinePrice: 18000,
  machineLiquidationValue: 12000,
  machineCapacity: 220, // đvsp/quý mỗi máy
  machineDepreciation: 0.05, // 5%/quý
  unitMaterial: 1.2, // đvsp cần bao nhiêu $ nguyên liệu (nhân materialPrice)

  // Thị trường
  baseSellPrice: 38,
  baseDemand: 1800,
  baseIndustryDemand: 4200,
  baseMaterialPrice: 8,
  competitorProductivityGrowth: 0.015, // 1.5% mỗi quý → giá trị xã hội giảm
  demandCyclePeriod: 8,
  baseSocialLaborTime: 6,

  // Xã hội
  strainPerHourAbove8: 0.6,
  recoveryFromWage: 0.02, // /100$ trên mức tối thiểu
  unrestFromLongHours: 0.7,
  unrestFromLayoff: 1.0, // per worker
  unrestReliefFromRaise: 0.5, // per % raise
  contradictionPerUnrest: 0.15,

  // Tài chính
  annualLoanRate: 0.08,
  quarterlyLoanRate: 0.02,
  loanUnit: 15000,
  maxDebt: 90000,
  eventChance: 0.45,
  inventoryCrisisRatio: 0.7,
  organicDiscoveryThreshold: 10,
  bankruptcyCashFloor: -15000,
  bankruptcyStressTurns: 3,

  // Ending thresholds
  contradictionRevolution: 100,
  unrestRiot: 90,
  bankruptcyDebtRatio: 3,
  monopolyShare: 0.6,
  reformContradictionMax: 40,
  reformHealthMin: 70,
} as const;

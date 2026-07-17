// Số liệu deterministic cho các round. Nguồn cho test.

export const R2 = {
  materials: 40,
  depreciation: 10,
  wage: 30,
  livingLaborValue: 60, // giá trị mới lao động sống tạo ra = v + m
  // Chuyển dịch: materials + depreciation = c
  // Giá trị mới: livingLaborValue = v + m; trong đó v=wage
  get c() {
    return this.materials + this.depreciation;
  },
  get v() {
    return this.wage;
  },
  get m() {
    return this.livingLaborValue - this.wage;
  },
  get total() {
    return this.c + this.livingLaborValue;
  },
} as const;

export const R3 = {
  wage: 40,
  base: { hours: 8, necessary: 4, surplus: 4, v: 40, m: 40, mRate: 1.0 },
  extended: { hours: 10, necessary: 4, surplus: 6, v: 40, m: 60, mRate: 1.5 },
} as const;

export const R4 = {
  pre: { livingHours: 8, output: 8, hoursPerUnit: 1, newValue: 80, necessary: 4, surplus: 4 },
  post: {
    livingHours: 8,
    output: 12,
    hoursPerUnit: 8 / 12, // 0.6667
    newValue: 80,
    necessary: 4,
    surplus: 4,
  },
<<<<<<< HEAD
  // Khi cải tiến được xã hội hóa, thời gian xã hội/đơn vị giảm. Vải rẻ hơn
  // trong rổ tiêu dùng minh họa làm thời gian tất yếu của ngày lao động giảm.
  socialLaborTime: { before: 1, after: 8 / 12 },
  necessaryLabor: { before: 4, after: 3.5 },
  surplusLabor: { before: 4, after: 4.5 },
=======
  // Sau khi đối thủ cũng áp máy → chuẩn xã hội giảm
  socialNorm: { before: 4, after: 3.5 },
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
} as const;

export const R5 = {
  unit: { c: 4, v: 3, m: 3, value: 10, price: 10 },
  options: [80, 100, 140] as const,
  effectiveDemand: 100,
  demandShock: 70,
} as const;

export interface R5Result {
  output: number;
  produced: {
    c: number;
    v: number;
    m: number;
    totalValue: number;
  };
  sold: number;
  unsold: number;
  revenue: number;
  costs: number; // c + v cho toàn bộ output
<<<<<<< HEAD
  realizedProfit: number;
=======
  accountingProfit: number;
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
}

export function computeR5(output: number): R5Result {
  const c = output * R5.unit.c;
  const v = output * R5.unit.v;
  const m = output * R5.unit.m;
  const totalValue = c + v + m;
  const sold = Math.min(output, R5.demandShock);
  const unsold = output - sold;
  const revenue = sold * R5.unit.price;
  const costs = c + v;
<<<<<<< HEAD
  const realizedProfit = revenue - costs;
=======
  const accountingProfit = revenue - costs;
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
  return {
    output,
    produced: { c, v, m, totalValue },
    sold,
    unsold,
    revenue,
    costs,
<<<<<<< HEAD
    realizedProfit,
=======
    accountingProfit,
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9
  };
}

export const R6 = {
  profit: 40,
  machinePrice: 30,
  ratios: [25, 50, 75, 100] as const,
} as const;

export interface R6Breakdown {
  ratioPct: number;
  retained: number;
  ownerConsumption: number;
  fund: number; // = retained (quỹ tích lũy khả dụng)
  canBuyMachine: boolean;
}

export function computeR6(ratioPct: number): R6Breakdown {
  const retained = Math.round((R6.profit * ratioPct) / 100);
  const ownerConsumption = R6.profit - retained;
  return {
    ratioPct,
    retained,
    ownerConsumption,
    fund: retained,
    canBuyMachine: retained >= R6.machinePrice,
  };
}
<<<<<<< HEAD

export function accumulationFundAfterPurchase(ratioPct: number) {
  const breakdown = computeR6(ratioPct);
  return breakdown.canBuyMachine ? breakdown.fund - R6.machinePrice : breakdown.fund;
}
=======
>>>>>>> cf29a6e21fe6579c43145096c56e4595468aaab9

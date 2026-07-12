import type { GameState } from "./types";
import { BAL } from "./balance";

export type ScalePhase =
  | "stable"
  | "accumulation"
  | "exploitation"
  | "crisis"
  | "rupture";

export interface ScaleReading {
  capital: number;
  labor: number;
  market: number;
  tilt: number; // -60..60, âm = nghiêng về lao động
  instability: number; // 0..200
  crackLevel: number; // 0..1
  phase: ScalePhase;
  phaseLabel: string;
  phaseHint: string;
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const PHASE_META: Record<ScalePhase, { label: string; hint: string }> = {
  stable: { label: "Ổn định", hint: "Xưởng đang cân bằng." },
  accumulation: { label: "Tích lũy căng", hint: "Tư bản dồn về máy móc và nợ." },
  exploitation: { label: "Bóc lột nóng", hint: "Lao động bị kéo căng." },
  crisis: { label: "Khủng hoảng thừa", hint: "Hàng làm ra không bán được." },
  rupture: { label: "Rạn vỡ", hint: "Mâu thuẫn cơ bản đang bung." },
};

export function readScale(s: GameState): ScaleReading {
  const debtRatioClamped = clamp(s.last.debtRatio, 0, 3);
  const inventoryRatio = clamp(s.inventory / Math.max(1, s.demand), 0, 2);
  const wageIndex = s.wagePerWorker / BAL.baseWagePerWorker;
  const supplyRatio =
    s.effectiveDemand > 0 ? s.industrySupply / s.effectiveDemand : 1;

  const capital =
    debtRatioClamped * 22 +
    Math.min(1, inventoryRatio) * 18 +
    Math.max(0, -s.last.profitRateReal) * 40 +
    s.reinvestmentRate * 12 +
    Math.max(0, s.last.organic - 1) * 8;

  const labor =
    s.contradiction * 0.45 +
    s.unrest * 0.3 +
    Math.max(0, s.workHours - 10) * 8 +
    Math.max(0, s.socialUnemployment - 8) * 1.4 +
    Math.max(0, 1 - wageIndex) * 30 +
    Math.max(0, s.last.exploitation - 1) * 15;

  const market =
    Math.min(1.2, inventoryRatio) * 28 +
    Math.max(0, supplyRatio - 1) * 35 +
    Math.max(0, s.overstockStreak) * 4;

  const capitalC = clamp(capital, 0, 120);
  const laborC = clamp(labor, 0, 120);
  const marketC = clamp(market, 0, 100);

  const tilt = clamp(capitalC - laborC, -60, 60);
  const instability = clamp(capitalC + laborC + marketC, 0, 200);
  const crackLevel = smoothstep(60, 130, instability + Math.max(0, s.contradiction - 60) * 0.6);

  let phase: ScalePhase = "stable";
  if (s.contradiction >= 85 || crackLevel >= 0.8) phase = "rupture";
  else if (marketC >= 45 || s.overstockStreak >= 2) phase = "crisis";
  else if (laborC >= 55 || s.last.exploitation > 1) phase = "exploitation";
  else if (capitalC >= 45) phase = "accumulation";

  const meta = PHASE_META[phase];

  return {
    capital: capitalC,
    labor: laborC,
    market: marketC,
    tilt,
    instability,
    crackLevel,
    phase,
    phaseLabel: meta.label,
    phaseHint: meta.hint,
  };
}

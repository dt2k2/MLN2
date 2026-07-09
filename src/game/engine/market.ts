import { BAL } from "../balance";
import type { GameState } from "../types";
import type { Rng } from "./rng";

export function tickMarket(s: GameState, rng: Rng) {
  // Năng suất xã hội tăng đều → giá trị xã hội của hàng hoá giảm
  s.industryProductivity *= 1 + BAL.competitorProductivityGrowth;
  const productivityDrag = 1 / s.industryProductivity;

  // Giá bán: kéo về giá trị xã hội, có nhiễu
  const noise = 0.95 + rng() * 0.1;
  s.sellPrice = BAL.baseSellPrice * productivityDrag * noise;

  // Giá nguyên liệu: dao động ±15%
  s.materialPrice = BAL.baseMaterialPrice * (0.85 + rng() * 0.3);

  // Cầu: chu kỳ boom/bust
  const cyc = Math.sin((s.turn / BAL.demandCyclePeriod) * Math.PI * 2);
  s.demand = Math.round(BAL.baseDemand * (1 + cyc * 0.25) * (0.9 + rng() * 0.2));

  // Overstock trigger giá sập
  if (s.overstockStreak >= 2) {
    s.sellPrice *= 0.7;
    s.demand = Math.round(s.demand * 0.6);
  }

  // Market share ước lượng: sản lượng / (sản lượng + đối thủ)
  const competitorOutput = 3 * BAL.baseDemand * 0.3 * s.industryProductivity;
  const own = s.last.output;
  s.marketShare = own / Math.max(1, own + competitorOutput);
}

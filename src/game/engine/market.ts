import { BAL } from "../balance";
import type { GameState } from "../types";
import { advanceCompetitors } from "./competitors";
import type { Rng } from "./rng";

export function tickMarket(s: GameState, rng: Rng) {
  s.competitors = advanceCompetitors(s);

  const competitorOutput = s.competitors.reduce(
    (total, competitor) => total + competitor.output,
    0,
  );
  const ownExpectedOutput = Math.max(1, s.last.output);
  s.industrySupply = competitorOutput + ownExpectedOutput;

  const weightedTech =
    s.competitors.reduce(
      (total, competitor) => total + competitor.techLevel * competitor.output,
      0,
    ) / Math.max(1, competitorOutput);
  s.industryProductivity = weightedTech;

  const cycle = Math.sin(((s.turn - 1) / BAL.demandCyclePeriod) * Math.PI * 2);
  const demandNoise = 0.96 + rng() * 0.08;
  s.effectiveDemand = Math.round(
    BAL.baseIndustryDemand * (1 + cycle * 0.12) * s.purchasingPowerIndex * demandNoise,
  );

  const ownProductivity = Math.max(0.01, s.last.laborProductivity);
  const socialProductivity = 1 / Math.max(0.01, s.last.socialLaborTime);
  const competitiveness = Math.max(
    0.65,
    Math.min(1.45, ownProductivity / Math.max(0.01, socialProductivity)),
  );
  const ownWeight = ownExpectedOutput * competitiveness;
  const competitorWeights = s.competitors.map(
    (competitor) => competitor.output * competitor.techLevel,
  );
  const totalWeight = ownWeight + competitorWeights.reduce((total, weight) => total + weight, 0);
  s.marketShare = ownWeight / Math.max(1, totalWeight);
  s.demand = Math.max(1, Math.round(s.effectiveDemand * s.marketShare));

  s.competitors = s.competitors.map((competitor, index) => ({
    ...competitor,
    marketShare: competitorWeights[index] / Math.max(1, totalWeight),
  }));

  const supplyPressure = Math.max(
    0.72,
    Math.min(1.08, s.effectiveDemand / Math.max(1, s.industrySupply)),
  );
  const priceNoise = 0.98 + rng() * 0.04;
  s.sellPrice = (BAL.baseSellPrice / s.industryProductivity) * supplyPressure * priceNoise;
  s.materialPrice = BAL.baseMaterialPrice * (0.9 + rng() * 0.2);
}

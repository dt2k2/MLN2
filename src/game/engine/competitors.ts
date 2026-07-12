import type { CompetitorSnapshot, GameState } from "../types";

const COMPETITORS = [
  { id: "bauer", name: "Bauer & Söhne", growth: 0.005, baseOutput: 820 },
  { id: "schmidt", name: "Schmidt Textil", growth: 0.015, baseOutput: 930 },
  { id: "krupp", name: "Krupp Textilwerke", growth: 0.025, baseOutput: 1_020 },
] as const;

export function createInitialCompetitors(): CompetitorSnapshot[] {
  return COMPETITORS.map((competitor) => ({
    id: competitor.id,
    name: competitor.name,
    archetype:
      competitor.id === "bauer"
        ? "Lao động thâm dụng"
        : competitor.id === "schmidt"
          ? "Trung bình ngành"
          : "Công nghệ và quy mô",
    techLevel: 1,
    scale: 1,
    output: competitor.baseOutput,
    priceIndex: 1,
    marketShare: 0.25,
  }));
}

export function advanceCompetitors(state: GameState): CompetitorSnapshot[] {
  return state.competitors.map((snapshot) => {
    const definition = COMPETITORS.find((item) => item.id === snapshot.id);
    if (!definition) return snapshot;

    const techLevel = snapshot.techLevel * (1 + definition.growth);
    const scaleBonus = snapshot.id === "krupp" && state.turn >= 13 ? 1.12 : 1;

    return {
      ...snapshot,
      techLevel,
      scale: scaleBonus,
      output: definition.baseOutput * techLevel * scaleBonus,
      priceIndex: 1 / techLevel,
    };
  });
}

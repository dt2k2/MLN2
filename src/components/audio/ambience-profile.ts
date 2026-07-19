import type { HeroCondition } from "@/game/heinrich";

export type AmbienceId = "factory-steady" | "factory-strained" | "crowd-distant";

export const AMBIENCE_BY_CONDITION: Record<HeroCondition, AmbienceId> = {
  neutral: "factory-steady",
  expansion: "factory-steady",
  dominant: "factory-steady",
  hardline: "factory-strained",
  "market-crisis": "factory-strained",
  "labor-conflict": "crowd-distant",
  rupture: "crowd-distant",
};

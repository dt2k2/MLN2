import type { HeroCondition } from "@/game/heinrich";

export type HeroMediaMode = "video" | "motion-poster" | "static-poster" | "fallback-poster";

export interface HeroVisualProfile {
  backgroundFilter: string;
  backgroundScale: number;
  backgroundX: number;
  backgroundY: number;
  subjectFilter: string;
  subjectScale: number;
  subjectX: number;
  subjectY: number;
  tint: string;
  vignetteOpacity: number;
  smoke: "steady" | "slow" | "strained" | "dense";
  crowd: boolean;
  papers: boolean;
  lightSweep: boolean;
  shake: boolean;
  cycleSeconds: number;
}

export const HERO_VISUAL_PROFILES: Record<HeroCondition, HeroVisualProfile> = {
  neutral: {
    backgroundFilter: "saturate(0.96) brightness(0.94)",
    backgroundScale: 1.012,
    backgroundX: -2,
    backgroundY: 0,
    subjectFilter: "saturate(0.98) brightness(0.98)",
    subjectScale: 1.006,
    subjectX: 0,
    subjectY: -1,
    tint: "rgba(198, 142, 45, 0.08)",
    vignetteOpacity: 0.22,
    smoke: "steady",
    crowd: false,
    papers: false,
    lightSweep: false,
    shake: false,
    cycleSeconds: 9,
  },
  expansion: {
    backgroundFilter: "saturate(1.08) brightness(1.02) contrast(1.02)",
    backgroundScale: 1.035,
    backgroundX: -4,
    backgroundY: -1,
    subjectFilter: "saturate(1.04) brightness(1.03)",
    subjectScale: 1.018,
    subjectX: 1,
    subjectY: -2,
    tint: "rgba(225, 148, 25, 0.11)",
    vignetteOpacity: 0.18,
    smoke: "steady",
    crowd: false,
    papers: false,
    lightSweep: true,
    shake: false,
    cycleSeconds: 8,
  },
  hardline: {
    backgroundFilter: "saturate(0.86) contrast(1.18) brightness(0.86)",
    backgroundScale: 1.018,
    backgroundX: -2,
    backgroundY: 0,
    subjectFilter: "saturate(0.88) contrast(1.18) brightness(0.91)",
    subjectScale: 1.004,
    subjectX: 0,
    subjectY: 0,
    tint: "rgba(168, 52, 20, 0.17)",
    vignetteOpacity: 0.34,
    smoke: "strained",
    crowd: false,
    papers: false,
    lightSweep: false,
    shake: false,
    cycleSeconds: 4.5,
  },
  "market-crisis": {
    backgroundFilter: "saturate(0.5) hue-rotate(9deg) brightness(0.74) contrast(1.08)",
    backgroundScale: 1.018,
    backgroundX: 0,
    backgroundY: 4,
    subjectFilter: "saturate(0.56) brightness(0.8) contrast(1.08)",
    subjectScale: 1.006,
    subjectX: 0,
    subjectY: 2,
    tint: "rgba(38, 77, 96, 0.28)",
    vignetteOpacity: 0.47,
    smoke: "slow",
    crowd: false,
    papers: false,
    lightSweep: false,
    shake: false,
    cycleSeconds: 11,
  },
  "labor-conflict": {
    backgroundFilter: "saturate(0.68) brightness(0.77) contrast(1.14)",
    backgroundScale: 1.025,
    backgroundX: -3,
    backgroundY: 0,
    subjectFilter: "saturate(0.72) brightness(0.82) contrast(1.12)",
    subjectScale: 1.012,
    subjectX: 4,
    subjectY: 0,
    tint: "rgba(96, 40, 45, 0.25)",
    vignetteOpacity: 0.41,
    smoke: "strained",
    crowd: true,
    papers: false,
    lightSweep: false,
    shake: false,
    cycleSeconds: 6,
  },
  rupture: {
    backgroundFilter: "saturate(0.68) brightness(0.68) contrast(1.24)",
    backgroundScale: 1.035,
    backgroundX: -5,
    backgroundY: 1,
    subjectFilter: "saturate(0.7) brightness(0.75) contrast(1.2)",
    subjectScale: 1.014,
    subjectX: 2,
    subjectY: 1,
    tint: "rgba(158, 25, 18, 0.31)",
    vignetteOpacity: 0.56,
    smoke: "dense",
    crowd: true,
    papers: true,
    lightSweep: false,
    shake: true,
    cycleSeconds: 4,
  },
  dominant: {
    backgroundFilter: "saturate(1.05) brightness(1.06) contrast(1.04)",
    backgroundScale: 1.04,
    backgroundX: -3,
    backgroundY: -2,
    subjectFilter: "saturate(1.02) brightness(1.04) contrast(1.04)",
    subjectScale: 1.02,
    subjectX: 0,
    subjectY: -2,
    tint: "rgba(231, 170, 52, 0.13)",
    vignetteOpacity: 0.14,
    smoke: "steady",
    crowd: false,
    papers: false,
    lightSweep: true,
    shake: false,
    cycleSeconds: 10,
  },
};

export interface HeroMediaAvailability {
  hasVideo: boolean;
  videoReady: boolean;
  videoFailed: boolean;
  layersReady: boolean;
  reducedMotion: boolean;
}

export function selectHeroMediaMode(availability: HeroMediaAvailability): HeroMediaMode {
  if (
    availability.hasVideo &&
    availability.videoReady &&
    !availability.videoFailed &&
    !availability.reducedMotion
  ) {
    return "video";
  }
  if (availability.layersReady) {
    return availability.reducedMotion ? "static-poster" : "motion-poster";
  }
  return "fallback-poster";
}

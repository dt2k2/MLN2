import type { HeroCondition } from "@/game/heinrich";

export type HeroMediaMode = "video" | "motion-poster" | "static-poster" | "fallback-poster";

export interface HeroSubjectMotion {
  x: number[];
  y: number[];
  scale: number[];
  scaleY: number[];
  rotate: number[];
  duration: number;
  repeatDelay: number;
}

export interface HeroVisualProfile {
  backgroundFilter: string;
  backgroundScale: number;
  backgroundX: number;
  backgroundY: number;
  subjectFilter: string;
  subjectBaseScale: number;
  subjectBaseX: number;
  subjectBaseY: number;
  subjectMotion: HeroSubjectMotion;
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
    subjectBaseScale: 0.96,
    subjectBaseX: -6,
    subjectBaseY: 2,
    subjectMotion: {
      x: [0, -1, 1, 0],
      y: [0, -3, -1, 0],
      scale: [0, 0.014, 0.008, 0],
      scaleY: [0, 0.008, 0.003, 0],
      rotate: [0, -0.16, 0.1, 0],
      duration: 5.8,
      repeatDelay: 0.4,
    },
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
    subjectFilter: "saturate(1.02) brightness(1.01)",
    subjectBaseScale: 0.97,
    subjectBaseX: 0,
    subjectBaseY: 2,
    subjectMotion: {
      x: [0, 4, 2, 0],
      y: [0, -5, -3, 0],
      scale: [0, 0.03, 0.02, 0],
      scaleY: [0, 0.012, 0.006, 0],
      rotate: [0, -0.28, -0.12, 0],
      duration: 4.8,
      repeatDelay: 0.8,
    },
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
    subjectFilter: "saturate(0.95) contrast(1.12) brightness(0.94)",
    subjectBaseScale: 0.97,
    subjectBaseX: 0,
    subjectBaseY: 2,
    subjectMotion: {
      x: [0, 4, 4, 0],
      y: [0, -2, -2, 0],
      scale: [0, 0.016, 0.014, 0],
      scaleY: [0, 0.006, 0.006, 0],
      rotate: [0, 0.34, 0.28, 0],
      duration: 2.5,
      repeatDelay: 1.8,
    },
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
    subjectFilter: "saturate(0.78) brightness(0.88) contrast(1.05)",
    subjectBaseScale: 0.91,
    subjectBaseX: -15,
    subjectBaseY: 3,
    subjectMotion: {
      x: [0, -2, 1, 0],
      y: [0, 5, 3, 0],
      scale: [0, -0.012, -0.006, 0],
      scaleY: [0, -0.01, -0.005, 0],
      rotate: [0, -0.38, -0.16, 0],
      duration: 6.6,
      repeatDelay: 0.8,
    },
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
    subjectFilter: "saturate(0.82) brightness(0.87) contrast(1.1)",
    subjectBaseScale: 0.97,
    subjectBaseX: 0,
    subjectBaseY: 2,
    subjectMotion: {
      x: [0, 6, 3, 0],
      y: [0, -3, -1, 0],
      scale: [0, 0.022, 0.012, 0],
      scaleY: [0, 0.008, 0.004, 0],
      rotate: [0, 0.42, 0.18, 0],
      duration: 3.7,
      repeatDelay: 0.7,
    },
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
    subjectFilter: "saturate(0.84) brightness(0.83) contrast(1.14)",
    subjectBaseScale: 0.95,
    subjectBaseX: 0,
    subjectBaseY: 3,
    subjectMotion: {
      x: [0, -5, 4, -3, 2, 0],
      y: [0, 3, -3, 2, -1, 0],
      scale: [0, 0.022, 0.008, 0.018, 0.01, 0],
      scaleY: [0, -0.01, 0.012, -0.006, 0.006, 0],
      rotate: [0, -0.55, 0.48, -0.32, 0.22, 0],
      duration: 1.15,
      repeatDelay: 2.3,
    },
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
    subjectBaseScale: 0.98,
    subjectBaseX: -10,
    subjectBaseY: 2,
    subjectMotion: {
      x: [0, 2, 1, 0],
      y: [0, -5, -3, 0],
      scale: [0, 0.028, 0.02, 0],
      scaleY: [0, 0.012, 0.007, 0],
      rotate: [0, -0.18, -0.08, 0],
      duration: 5.6,
      repeatDelay: 1,
    },
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

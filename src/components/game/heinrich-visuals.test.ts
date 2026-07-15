import { describe, expect, it } from "vitest";
import type { HeroCondition } from "@/game/heinrich";
import { HERO_VISUAL_PROFILES, selectHeroMediaMode } from "./heinrich-visuals";

describe("Heinrich visual profiles", () => {
  it("defines a complete, distinct profile for all seven conditions", () => {
    const conditions: HeroCondition[] = [
      "neutral",
      "expansion",
      "hardline",
      "market-crisis",
      "labor-conflict",
      "rupture",
      "dominant",
    ];

    expect(Object.keys(HERO_VISUAL_PROFILES)).toEqual(conditions);
    expect(HERO_VISUAL_PROFILES["labor-conflict"].crowd).toBe(true);
    expect(HERO_VISUAL_PROFILES.rupture).toMatchObject({
      crowd: true,
      papers: true,
      shake: true,
      smoke: "dense",
    });
    expect(HERO_VISUAL_PROFILES.neutral.shake).toBe(false);
    for (const condition of conditions) {
      const profile = HERO_VISUAL_PROFILES[condition];
      expect(profile.subjectBaseScale).toBeGreaterThan(0.8);
      expect(profile.subjectBaseScale).toBeLessThanOrEqual(1);
      expect(Number.isFinite(profile.subjectBaseX)).toBe(true);
      expect(Number.isFinite(profile.subjectBaseY)).toBe(true);
      const keyframeCount = profile.subjectMotion.x.length;
      expect(profile.subjectMotion.y).toHaveLength(keyframeCount);
      expect(profile.subjectMotion.scale).toHaveLength(keyframeCount);
      expect(profile.subjectMotion.scaleY).toHaveLength(keyframeCount);
      expect(profile.subjectMotion.rotate).toHaveLength(keyframeCount);
      expect(Math.max(...profile.subjectMotion.x.map(Math.abs))).toBeGreaterThanOrEqual(1);
      expect(profile.subjectMotion.duration).toBeGreaterThan(0);
    }
  });

  it("uses a playable MP4 ahead of the motion poster", () => {
    expect(
      selectHeroMediaMode({
        hasVideo: true,
        videoReady: true,
        videoFailed: false,
        layersReady: true,
        reducedMotion: false,
      }),
    ).toBe("video");
  });

  it("keeps the motion poster visible while video is absent, loading, or failed", () => {
    const base = { layersReady: true, reducedMotion: false };
    expect(
      selectHeroMediaMode({ ...base, hasVideo: false, videoReady: false, videoFailed: false }),
    ).toBe("motion-poster");
    expect(
      selectHeroMediaMode({ ...base, hasVideo: true, videoReady: false, videoFailed: false }),
    ).toBe("motion-poster");
    expect(
      selectHeroMediaMode({ ...base, hasVideo: true, videoReady: false, videoFailed: true }),
    ).toBe("motion-poster");
  });

  it("falls back to the original poster when either 2.5D layer is unavailable", () => {
    expect(
      selectHeroMediaMode({
        hasVideo: false,
        videoReady: false,
        videoFailed: false,
        layersReady: false,
        reducedMotion: false,
      }),
    ).toBe("fallback-poster");
  });

  it("uses a static layered poster when reduced motion is requested", () => {
    expect(
      selectHeroMediaMode({
        hasVideo: true,
        videoReady: true,
        videoFailed: false,
        layersReady: true,
        reducedMotion: true,
      }),
    ).toBe("static-poster");
  });
});

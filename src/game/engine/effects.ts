import type { GameState, TimedEffect, TimedEffectKind } from "../types";

export function effectMultiplier(state: GameState, kind: TimedEffectKind): number {
  return state.activeEffects
    .filter((effect) => effect.kind === kind)
    .reduce((total, effect) => total * effect.value, 1);
}

export function effectiveWorkHoursCap(state: GameState): number {
  const timedCaps = state.activeEffects
    .filter((effect) => effect.kind === "workHoursCap")
    .map((effect) => effect.value);

  return Math.min(state.legalMaxWorkHours, ...timedCaps, Number.POSITIVE_INFINITY);
}

export function addOrRefreshEffect(effects: TimedEffect[], incoming: TimedEffect): TimedEffect[] {
  const existing = effects.findIndex((effect) => effect.id === incoming.id);
  if (existing < 0) return [...effects, incoming];

  return effects.map((effect, index) =>
    index === existing
      ? {
          ...incoming,
          remainingTurns: Math.max(effect.remainingTurns, incoming.remainingTurns),
        }
      : effect,
  );
}

export function tickEffects(effects: TimedEffect[]): TimedEffect[] {
  return effects
    .map((effect) => ({
      ...effect,
      remainingTurns: effect.remainingTurns - 1,
    }))
    .filter((effect) => effect.remainingTurns > 0);
}

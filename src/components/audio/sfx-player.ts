export type SfxId =
  | "achievement"
  | "concept-unlock"
  | "decision-select"
  | "decision-undo"
  | "event-alert"
  | "quarter-complete"
  | "round-retry"
  | "round-success";

const SFX_SRC: Record<SfxId, string> = {
  achievement: "/audio/achievement.mp3",
  "concept-unlock": "/audio/concept-unlock.mp3",
  "decision-select": "/audio/decision-select.mp3",
  "decision-undo": "/audio/decision-undo.mp3",
  "event-alert": "/audio/event-alert.mp3",
  "quarter-complete": "/audio/quarter-complete.mp3",
  "round-retry": "/audio/round-retry.mp3",
  "round-success": "/audio/round-success.mp3",
};

const SFX_VOLUME: Record<SfxId, number> = {
  achievement: 0.48,
  "concept-unlock": 0.42,
  "decision-select": 0.34,
  "decision-undo": 0.32,
  "event-alert": 0.4,
  "quarter-complete": 0.44,
  "round-retry": 0.28,
  "round-success": 0.42,
};

export const SFX_STORAGE_KEY = "dk.sfx.muted";
export const SFX_MUTE_EVENT = "dk:sfx-muted";

const audioCache = new Map<SfxId, HTMLAudioElement>();

export function isSfxMuted() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SFX_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSfxMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SFX_STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // Muting still works for this session when persistence is unavailable.
  }
  window.dispatchEvent(new CustomEvent<boolean>(SFX_MUTE_EVENT, { detail: muted }));
}

export function preloadSfx() {
  if (typeof window === "undefined") return;
  for (const id of Object.keys(SFX_SRC) as SfxId[]) getTemplate(id);
}

export function playSfx(id: SfxId) {
  if (typeof window === "undefined" || isSfxMuted()) return;

  const template = getTemplate(id);
  const audio = template.paused ? template : (template.cloneNode(true) as HTMLAudioElement);
  audio.currentTime = 0;
  audio.volume = SFX_VOLUME[id];
  void audio.play().catch(() => {
    // Browsers may reject playback before the first user gesture.
  });
}

function getTemplate(id: SfxId) {
  const cached = audioCache.get(id);
  if (cached) return cached;

  const audio = new Audio(SFX_SRC[id]);
  audio.preload = "auto";
  audioCache.set(id, audio);
  return audio;
}

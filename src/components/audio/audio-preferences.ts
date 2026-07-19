export const MUSIC_STORAGE_KEY = "dk.music.muted";
export const MUSIC_MUTE_EVENT = "dk:music-muted";

export function isMusicMuted() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUSIC_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMusicMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUSIC_STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // The current session still updates through the event below.
  }
  window.dispatchEvent(new CustomEvent<boolean>(MUSIC_MUTE_EVENT, { detail: muted }));
}

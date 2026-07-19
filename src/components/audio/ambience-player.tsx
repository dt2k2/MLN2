import { useEffect, useRef, useState } from "react";
import type { HeroCondition } from "@/game/heinrich";
import { AMBIENCE_BY_CONDITION } from "./ambience-profile";
import type { AmbienceId } from "./ambience-profile";
import { isSfxMuted, SFX_MUTE_EVENT } from "./sfx-player";

const AMBIENCE_SRC: Record<AmbienceId, string> = {
  "factory-steady": "/audio/factory-steady.mp3",
  "factory-strained": "/audio/factory-strained.mp3",
  "crowd-distant": "/audio/crowd-distant.mp3",
};

const AMBIENCE_VOLUME: Record<AmbienceId, number> = {
  "factory-steady": 0.11,
  "factory-strained": 0.13,
  "crowd-distant": 0.1,
};

const CROSSFADE_MS = 1000;

export function AmbiencePlayer({ condition }: { condition: HeroCondition }) {
  const activeRef = useRef<HTMLAudioElement | null>(null);
  const audioPoolRef = useRef(new Set<HTMLAudioElement>());
  const [muted, setMuted] = useState(false);
  const ambience = AMBIENCE_BY_CONDITION[condition];

  useEffect(() => {
    setMuted(isSfxMuted());
    const onMute = (event: Event) => setMuted((event as CustomEvent<boolean>).detail);
    window.addEventListener(SFX_MUTE_EVENT, onMute);
    return () => window.removeEventListener(SFX_MUTE_EVENT, onMute);
  }, []);

  useEffect(() => {
    const audioPool = audioPoolRef.current;
    const previous = activeRef.current;
    if (muted) {
      if (previous) fade(previous, previous.volume, 0, () => previous.pause());
      return;
    }

    const next = new Audio(AMBIENCE_SRC[ambience]);
    next.loop = true;
    next.preload = "auto";
    next.volume = 0;
    activeRef.current = next;
    audioPool.add(next);
    let resumePlayback: (() => void) | null = null;

    const start = () => {
      fade(next, 0, AMBIENCE_VOLUME[ambience]);
      if (previous && previous !== next) {
        fade(previous, previous.volume, 0, () => {
          previous.pause();
          audioPool.delete(previous);
        });
      }
    };

    void next
      .play()
      .then(start)
      .catch(() => {
        const resume = () => {
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
          resumePlayback = null;
          void next
            .play()
            .then(start)
            .catch(() => {
              // The ambience stays silent if playback remains blocked.
            });
        };
        resumePlayback = resume;
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      });

    return () => {
      if (!resumePlayback) return;
      window.removeEventListener("pointerdown", resumePlayback);
      window.removeEventListener("keydown", resumePlayback);
      cancelFade(next);
      next.pause();
      audioPool.delete(next);
      if (activeRef.current === next) activeRef.current = null;
    };
  }, [ambience, muted]);

  useEffect(() => {
    const audioPool = audioPoolRef.current;
    return () => {
      for (const audio of audioPool) {
        cancelFade(audio);
        audio.pause();
      }
      audioPool.clear();
    };
  }, []);

  return null;
}

function fade(audio: HTMLAudioElement, from: number, to: number, done?: () => void) {
  cancelFade(audio);
  const startedAt = performance.now();
  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / CROSSFADE_MS);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * progress));
    if (progress < 1) {
      const frame = window.requestAnimationFrame(tick);
      fadeFrames.set(audio, frame);
    } else {
      fadeFrames.delete(audio);
      done?.();
    }
  };
  const frame = window.requestAnimationFrame(tick);
  fadeFrames.set(audio, frame);
}

const fadeFrames = new WeakMap<HTMLAudioElement, number>();

function cancelFade(audio: HTMLAudioElement) {
  const frame = fadeFrames.get(audio);
  if (frame !== undefined) window.cancelAnimationFrame(frame);
  fadeFrames.delete(audio);
}

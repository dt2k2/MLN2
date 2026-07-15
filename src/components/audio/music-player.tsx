import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";

type Track = "menu" | "prologue" | "ingame" | null;

const TRACK_SRC: Record<Exclude<Track, null>, string> = {
  menu: "/audio/music/main-menu.mp3",
  prologue: "/audio/music/prologue.mp3",
  ingame: "/audio/music/ingame.mp3",
};

const STORAGE_KEY = "dk.music.muted";
const TARGET_VOLUME = 0.45;
const FADE_MS = 700;

function pickTrack(pathname: string): Track {
  if (pathname.startsWith("/intro")) return "prologue";
  if (pathname.startsWith("/game")) return "ingame";
  if (pathname.startsWith("/ending")) return "ingame";
  return "menu";
}

export function MusicPlayer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const track = pickTrack(pathname);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const currentTrackRef = useRef<Track>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [needsGesture, setNeedsGesture] = useState<boolean>(false);

  // Load persisted mute preference
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") setMuted(true);
    } catch {}
  }, []);

  // Manage playback / crossfade when track or mute changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      const a = new Audio();
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      audioRef.current = a;
    }
    const audio = audioRef.current;

    if (muted || !track) {
      fadeTo(audio, 0, FADE_MS, () => {
        audio.pause();
      });
      return;
    }

    if (currentTrackRef.current !== track) {
      const swap = () => {
        audio.src = TRACK_SRC[track];
        audio.currentTime = 0;
        currentTrackRef.current = track;
        const p = audio.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            setNeedsGesture(false);
            fadeTo(audio, TARGET_VOLUME, FADE_MS);
          }).catch(() => {
            setNeedsGesture(true);
          });
        }
      };
      if (audio.paused || audio.volume === 0) {
        swap();
      } else {
        fadeTo(audio, 0, FADE_MS, swap);
      }
    } else {
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          setNeedsGesture(false);
          fadeTo(audio, TARGET_VOLUME, FADE_MS);
        }).catch(() => setNeedsGesture(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, muted]);

  // Try to resume on first user gesture if autoplay was blocked
  useEffect(() => {
    if (!needsGesture) return;
    const resume = () => {
      const audio = audioRef.current;
      if (!audio || muted || !track) return;
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          setNeedsGesture(false);
          fadeTo(audio, TARGET_VOLUME, FADE_MS);
        }).catch(() => {});
      }
    };
    const opts = { once: true } as const;
    window.addEventListener("pointerdown", resume, opts);
    window.addEventListener("keydown", resume, opts);
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [needsGesture, muted, track]);

  const toggle = () => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  function fadeTo(
    audio: HTMLAudioElement,
    target: number,
    duration: number,
    done?: () => void,
  ) {
    if (fadeRef.current) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
    const start = audio.volume;
    const startTime = performance.now();
    fadeRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startTime) / duration);
      audio.volume = start + (target - start) * t;
      if (t >= 1) {
        if (fadeRef.current) {
          window.clearInterval(fadeRef.current);
          fadeRef.current = null;
        }
        done?.();
      }
    }, 30);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Bật nhạc nền" : "Tắt nhạc nền"}
      title={muted ? "Bật nhạc nền" : "Tắt nhạc nền"}
      className="fixed bottom-4 right-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-md backdrop-blur transition hover:bg-background"
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}

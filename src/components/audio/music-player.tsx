import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BellOff, BellRing, Volume2, VolumeX } from "lucide-react";
import { isSfxMuted, preloadSfx, setSfxMuted } from "./sfx-player";
import { isMusicMuted, MUSIC_MUTE_EVENT, setMusicMuted } from "./audio-preferences";

type Track = "menu" | "prologue" | "ingame" | null;

const TRACK_SRC: Record<Exclude<Track, null>, string> = {
  menu: "/audio/main-menu.mp3",
  prologue: "/audio/prologue.mp3",
  ingame: "/audio/ingame.mp3",
};

const TRACK_VOLUME: Record<Exclude<Track, null>, number> = {
  menu: 1.0,
  prologue: 0.7,
  ingame: 0.5,
};
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
  const [sfxMuted, setSfxMutedState] = useState<boolean>(false);
  const [needsGesture, setNeedsGesture] = useState<boolean>(false);

  // Load persisted mute preference
  useEffect(() => {
    try {
      setMuted(isMusicMuted());
      setSfxMutedState(isSfxMuted());
    } catch {
      // Storage can be unavailable in privacy-restricted browsing contexts.
    }
    preloadSfx();
    const onMusicMute = (event: Event) => setMuted((event as CustomEvent<boolean>).detail);
    window.addEventListener(MUSIC_MUTE_EVENT, onMusicMute);
    return () => window.removeEventListener(MUSIC_MUTE_EVENT, onMusicMute);
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
            fadeTo(audio, TRACK_VOLUME[track], FADE_MS);
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
          fadeTo(audio, TRACK_VOLUME[track], FADE_MS);
        }).catch(() => setNeedsGesture(true));
      }
    }
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
          fadeTo(audio, TRACK_VOLUME[track], FADE_MS);
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
      setMusicMuted(next);
      return next;
    });
  };

  const toggleSfx = () => {
    setSfxMutedState((current) => {
      const next = !current;
      setSfxMuted(next);
      return next;
    });
  };

  function fadeTo(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
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

  if (pathname.startsWith("/intro")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
      <button
        type="button"
        onClick={toggleSfx}
        aria-label={sfxMuted ? "Bật hiệu ứng âm thanh" : "Tắt hiệu ứng âm thanh"}
        title={sfxMuted ? "Bật hiệu ứng âm thanh" : "Tắt hiệu ứng âm thanh"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-md backdrop-blur transition hover:bg-background"
      >
        {sfxMuted ? <BellOff className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "Bật nhạc nền" : "Tắt nhạc nền"}
        title={muted ? "Bật nhạc nền" : "Tắt nhạc nền"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-md backdrop-blur transition hover:bg-background"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

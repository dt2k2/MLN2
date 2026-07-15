import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import heinrichPoster from "@/assets/intro-2-heinrich.jpg";
import heinrichCutout from "@/assets/heinrich/heinrich-cutout.webp";
import heinrichRoom from "@/assets/heinrich/heinrich-room.webp";
import { deriveHeinrichPresentation } from "@/game/heinrich";
import type { HeroCondition } from "@/game/heinrich";
import type { GameState } from "@/game/types";
import { HERO_VISUAL_PROFILES } from "./heinrich-visuals";

const videoModules = import.meta.glob("../../assets/heinrich/*.mp4", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const SMOKE_PARTICLES = [
  { left: "8%", bottom: "31%", size: 22, delay: 0, drift: -6 },
  { left: "13%", bottom: "36%", size: 15, delay: 1.4, drift: 8 },
  { left: "70%", bottom: "39%", size: 20, delay: 0.7, drift: -4 },
  { left: "77%", bottom: "42%", size: 13, delay: 2.1, drift: 7 },
  { left: "62%", bottom: "34%", size: 17, delay: 2.8, drift: 4 },
] as const;

const CROWD_FIGURES = [
  { left: "62%", height: 29, delay: 0 },
  { left: "67%", height: 34, delay: 0.8 },
  { left: "73%", height: 27, delay: 1.4 },
  { left: "79%", height: 33, delay: 0.35 },
] as const;

const FLYING_PAPERS = [
  { left: "18%", top: "24%", rotate: -13, delay: 0 },
  { left: "74%", top: "19%", rotate: 9, delay: 0.7 },
  { left: "83%", top: "55%", rotate: -7, delay: 1.2 },
  { left: "51%", top: "13%", rotate: 15, delay: 1.8 },
] as const;

function findVideo(fileName: string) {
  return Object.entries(videoModules).find(([path]) => path.endsWith(`/${fileName}`))?.[1];
}

function HeinrichMotionPoster({
  condition,
  reducedMotion,
}: {
  condition: HeroCondition;
  reducedMotion: boolean;
}) {
  const profile = HERO_VISUAL_PROFILES[condition];
  const [roomReady, setRoomReady] = useState(false);
  const [cutoutReady, setCutoutReady] = useState(false);
  const [layerFailed, setLayerFailed] = useState(false);
  const layersReady = roomReady && cutoutReady && !layerFailed;
  const smokeDuration = profile.smoke === "strained" ? 3.2 : profile.smoke === "dense" ? 4.2 : 6.5;
  const smokeOpacity =
    profile.smoke === "dense" ? 0.38 : profile.smoke === "strained" ? 0.24 : 0.16;

  const cameraAnimation = reducedMotion
    ? { scale: 1, x: 0, y: 0 }
    : {
        scale: [1, profile.backgroundScale, 1],
        x: [0, profile.backgroundX, 0],
        y: [0, profile.backgroundY, 0],
      };
  const subjectAnimation = reducedMotion
    ? { scale: 1, x: 0, y: 0 }
    : {
        scale: [1, profile.subjectScale, 1],
        x: [0, profile.subjectX, 0],
        y: [0, profile.subjectY, 0],
      };

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <img
        src={heinrichPoster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />

      <img
        src={heinrichRoom}
        alt=""
        className="pointer-events-none absolute h-px w-px opacity-0"
        onLoad={() => setRoomReady(true)}
        onError={() => setLayerFailed(true)}
      />
      <img
        src={heinrichCutout}
        alt=""
        className="pointer-events-none absolute h-px w-px opacity-0"
        onLoad={() => setCutoutReady(true)}
        onError={() => setLayerFailed(true)}
      />

      <AnimatePresence initial={false} mode="popLayout">
        {layersReady ? (
          <motion.div
            key={condition}
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={
              profile.shake && !reducedMotion
                ? { opacity: 1, x: [0, -2, 2, -1, 1, 0] }
                : { opacity: 1, x: 0 }
            }
            exit={{ opacity: 0 }}
            transition={
              profile.shake && !reducedMotion
                ? {
                    opacity: { duration: 0.25 },
                    x: { duration: 0.42, repeat: Infinity, repeatDelay: 3.6 },
                  }
                : { duration: 0.25, ease: [0.19, 1, 0.22, 1] }
            }
          >
            <motion.img
              src={heinrichRoom}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ filter: profile.backgroundFilter }}
              animate={cameraAnimation}
              transition={{
                duration: reducedMotion ? 0 : profile.cycleSeconds,
                ease: "easeInOut",
                repeat: reducedMotion ? 0 : Infinity,
              }}
            />

            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: profile.tint }}
              animate={
                reducedMotion || condition !== "rupture"
                  ? { opacity: 1 }
                  : { opacity: [0.75, 1, 0.82, 1] }
              }
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            />

            {!reducedMotion
              ? SMOKE_PARTICLES.slice(0, profile.smoke === "dense" ? 5 : 3).map(
                  (particle, index) => (
                    <motion.span
                      key={`${particle.left}-${particle.delay}`}
                      className="absolute rounded-full bg-stone-200 blur-md"
                      style={{
                        left: particle.left,
                        bottom: particle.bottom,
                        width: particle.size,
                        height: particle.size,
                        opacity: smokeOpacity,
                      }}
                      animate={{
                        x: [0, particle.drift, particle.drift * 1.6],
                        y: [0, -24 - index * 3, -48 - index * 4],
                        scale: [0.65, 1.15, 1.55],
                        opacity: [0, smokeOpacity, 0],
                      }}
                      transition={{
                        duration: smokeDuration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ),
                )
              : null}

            {profile.crowd ? (
              <div className="absolute inset-0">
                {CROWD_FIGURES.map((figure) => (
                  <motion.span
                    key={figure.left}
                    className="absolute bottom-[38%] block rounded-t-full bg-black/55 blur-[0.5px]"
                    style={{ left: figure.left, width: 12, height: figure.height }}
                    animate={
                      reducedMotion
                        ? { x: 0, opacity: 0.48 }
                        : { x: [0, 2, -1, 0], opacity: [0.38, 0.58, 0.42] }
                    }
                    transition={{
                      duration: 4.5,
                      delay: figure.delay,
                      repeat: reducedMotion ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            ) : null}

            <motion.img
              src={heinrichCutout}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-center drop-shadow-[0_8px_12px_rgba(0,0,0,0.24)]"
              style={{ filter: profile.subjectFilter }}
              animate={subjectAnimation}
              transition={{
                duration: reducedMotion ? 0 : profile.cycleSeconds * 0.72,
                ease: "easeInOut",
                repeat: reducedMotion ? 0 : Infinity,
              }}
            />

            {profile.lightSweep && !reducedMotion ? (
              <motion.div
                className="absolute inset-y-0 w-1/4 -skew-x-12 bg-white/10 blur-xl"
                initial={{ x: "-120%", opacity: 0 }}
                animate={{ x: "520%", opacity: [0, 0.18, 0] }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  repeatDelay: 3.2,
                  ease: "easeInOut",
                }}
              />
            ) : null}

            {profile.papers && !reducedMotion
              ? FLYING_PAPERS.map((paper) => (
                  <motion.span
                    key={`${paper.left}-${paper.top}`}
                    className="absolute h-2.5 w-4 border border-amber-100/60 bg-amber-50/75 shadow-sm"
                    style={{ left: paper.left, top: paper.top }}
                    animate={{
                      x: [0, 18, -8],
                      y: [0, -16, 24],
                      rotate: [paper.rotate, paper.rotate + 25, paper.rotate - 8],
                      opacity: [0, 0.9, 0],
                    }}
                    transition={{
                      duration: 3.4,
                      delay: paper.delay,
                      repeat: Infinity,
                      repeatDelay: 1.1,
                      ease: "easeInOut",
                    }}
                  />
                ))
              : null}

            <div
              className="absolute inset-0"
              style={{
                boxShadow: `inset 0 0 72px 18px rgba(0, 0, 0, ${profile.vignetteOpacity})`,
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function HeinrichPortrait({ state }: { state: GameState }) {
  const presentation = useMemo(() => deriveHeinrichPresentation(state), [state]);
  const reduceMotion = useReducedMotion() ?? false;
  const [readyVideo, setReadyVideo] = useState<string | null>(null);
  const [failedVideos, setFailedVideos] = useState<string[]>([]);
  const videoSrc = findVideo(presentation.videoFile);
  const canPlayVideo =
    !reduceMotion && !!videoSrc && !failedVideos.includes(presentation.videoFile);

  useEffect(() => {
    setReadyVideo(null);
  }, [presentation.condition, videoSrc]);

  return (
    <figure
      className={`panel-industrial relative overflow-hidden rounded-lg border p-2.5 ${
        presentation.condition === "rupture"
          ? "pulse-danger border-destructive/60"
          : "border-border/70"
      }`}
      aria-labelledby="heinrich-heading"
      aria-describedby="heinrich-caption"
    >
      <header className="flex h-7 items-start justify-between gap-2">
        <h2
          id="heinrich-heading"
          className="truncate pt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Heinrich · Chủ xưởng
        </h2>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none ${presentation.tone}`}
          title={presentation.hint}
        >
          {presentation.label}
        </span>
      </header>

      <div className="relative aspect-video min-h-0 overflow-hidden rounded border border-border/50 bg-panel-elevated">
        <HeinrichMotionPoster condition={presentation.condition} reducedMotion={reduceMotion} />

        {canPlayVideo ? (
          <AnimatePresence mode="popLayout">
            <motion.video
              key={videoSrc}
              src={videoSrc}
              aria-hidden="true"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              initial={{ opacity: 0 }}
              animate={{ opacity: readyVideo === videoSrc ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              className="absolute inset-0 h-full w-full object-cover object-center"
              onCanPlay={() => setReadyVideo(videoSrc)}
              onError={() => {
                setReadyVideo(null);
                setFailedVideos((current) =>
                  current.includes(presentation.videoFile)
                    ? current
                    : [...current, presentation.videoFile],
                );
              }}
            />
          </AnimatePresence>
        ) : null}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-black/20"
          aria-hidden="true"
        />
      </div>

      <figcaption
        id="heinrich-caption"
        aria-live="polite"
        className="flex min-h-12 items-center px-1 pt-1.5 text-[11px] italic leading-snug text-muted-foreground"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={presentation.monologue}
            initial={reduceMotion ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
          >
            “{presentation.monologue}”
          </motion.p>
        </AnimatePresence>
      </figcaption>
    </figure>
  );
}

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import heinrichPoster from "@/assets/intro-2-heinrich.jpg";
import { deriveHeinrichPresentation } from "@/game/heinrich";
import type { GameState } from "@/game/types";

const videoModules = import.meta.glob("../../assets/heinrich/*.mp4", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function findVideo(fileName: string) {
  return Object.entries(videoModules).find(([path]) => path.endsWith(`/${fileName}`))?.[1];
}

export function HeinrichPortrait({ state }: { state: GameState }) {
  const presentation = useMemo(() => deriveHeinrichPresentation(state), [state]);
  const reduceMotion = useReducedMotion();
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
        <img
          src={heinrichPoster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-black/25"
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

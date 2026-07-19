import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Lightbulb, SkipForward, X } from "lucide-react";
import { TUTORIAL_STEPS, visiblePages } from "@/tutorial/steps";
import { useTutorialStore, hintFor } from "@/tutorial/state";
import { useTargetRect, type TargetRect } from "@/tutorial/use-target-rect";
import { useGameStore } from "@/game/state";
import type { GameState } from "@/game/types";

const PANEL_WIDTH = 360;
const PANEL_GAP = 16;

function panelPosition(
  rect: TargetRect,
  placement: "auto" | "left" | "right" | "top" | "bottom",
  viewport: { w: number; h: number },
): { top: number; left: number; width: number } {
  const width = Math.min(PANEL_WIDTH, viewport.w - 24);
  const isMobile = viewport.w < 768;
  if (isMobile) {
    return { top: viewport.h - 300, left: (viewport.w - width) / 2, width };
  }

  let p = placement;
  if (p === "auto") {
    if (rect.left + rect.width + PANEL_GAP + width < viewport.w) p = "right";
    else if (rect.left - PANEL_GAP - width > 0) p = "left";
    else if (rect.top - PANEL_GAP - 260 > 0) p = "top";
    else p = "bottom";
  }

  const centerY = Math.max(12, Math.min(viewport.h - 280, rect.top + rect.height / 2 - 120));
  switch (p) {
    case "right":
      return {
        top: centerY,
        left: Math.min(viewport.w - width - 12, rect.left + rect.width + PANEL_GAP),
        width,
      };
    case "left":
      return {
        top: centerY,
        left: Math.max(12, rect.left - PANEL_GAP - width),
        width,
      };
    case "top":
      return {
        top: Math.max(12, rect.top - PANEL_GAP - 260),
        left: Math.max(12, Math.min(viewport.w - width - 12, rect.left)),
        width,
      };
    case "bottom":
    default:
      return {
        top: Math.min(viewport.h - 280, rect.top + rect.height + PANEL_GAP),
        left: Math.max(12, Math.min(viewport.w - width - 12, rect.left)),
        width,
      };
  }
}

function useViewport() {
  const [vp, set] = useState(() => ({
    w: typeof window === "undefined" ? 1280 : window.innerWidth,
    h: typeof window === "undefined" ? 800 : window.innerHeight,
  }));
  useEffect(() => {
    const onResize = () => set({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vp;
}

export function TutorialOverlay({
  onOpenDecisionGroup,
}: {
  onOpenDecisionGroup?: (groupId: string) => void;
}) {
  const active = useTutorialStore((s) => s.active);
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const pageIndex = useTutorialStore((s) => s.pageIndex);
  const next = useTutorialStore((s) => s.next);
  const prev = useTutorialStore((s) => s.previous);
  const requestSkip = useTutorialStore((s) => s.requestSkip);
  const askSkip = useTutorialStore((s) => s.askSkip);
  const cancelSkip = useTutorialStore((s) => s.cancelSkip);
  const confirmSkip = useTutorialStore((s) => s.confirmSkip);
  const pendingHint = useTutorialStore((s) => s.pendingHint);
  const dismissHint = useTutorialStore((s) => s.dismissHint);

  const gameState = useGameStore((s) => s.state);
  const queueLen = useGameStore((s) => s.presentationQueue.length);
  const pendingEvent = gameState.pendingEvent;
  const paused = queueLen > 0 || !!pendingEvent;

  const step = active ? TUTORIAL_STEPS[stepIndex] : null;
  const viewport = useViewport();

  useEffect(() => {
    if (step?.openGroup && onOpenDecisionGroup) onOpenDecisionGroup(step.openGroup);
  }, [step, onOpenDecisionGroup]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (askSkip) return;
      if (!active && !pendingHint) return;
      if (e.key === "Escape") {
        if (pendingHint) dismissHint();
        else if (active) requestSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, pendingHint, askSkip, requestSkip, dismissHint]);

  return (
    <>
      {active && !paused && step ? (
        <StepOverlay
          stepIndex={stepIndex}
          pageIndex={pageIndex}
          gameState={gameState}
          viewport={viewport}
          onNext={next}
          onPrev={prev}
          onSkip={requestSkip}
        />
      ) : null}

      {pendingHint ? (
        <HintOverlay id={pendingHint} viewport={viewport} onClose={dismissHint} />
      ) : null}

      <SkipConfirm open={askSkip} onCancel={cancelSkip} onConfirm={confirmSkip} />
    </>
  );
}

function StepOverlay({
  stepIndex,
  pageIndex,
  gameState,
  viewport,
  onNext,
  onPrev,
  onSkip,
}: {
  stepIndex: number;
  pageIndex: number;
  gameState: GameState;
  viewport: { w: number; h: number };
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const step = TUTORIAL_STEPS[stepIndex];
  const pages = visiblePages(step, gameState);
  const safePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1));
  const page = pages[safePageIndex];
  const rect = useTargetRect(page?.target ?? null, [stepIndex, safePageIndex]);
  if (!page || !rect) return null;

  const panel = panelPosition(rect, page.placement ?? "auto", viewport);
  const totalSteps = TUTORIAL_STEPS.length;
  const padding = 8;
  const isLastPage = safePageIndex >= pages.length - 1;
  const isFirstOfAll = stepIndex === 0 && safePageIndex === 0;
  const advance = step.advance.kind;
  const bodyText = typeof page.body === "function" ? page.body(gameState) : page.body;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40"
      role="dialog"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-body"
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="tut-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - padding}
              y={rect.top - padding}
              width={rect.width + padding * 2}
              height={rect.height + padding * 2}
              rx={10}
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tut-mask)" />
        <rect
          x={rect.left - padding}
          y={rect.top - padding}
          width={rect.width + padding * 2}
          height={rect.height + padding * 2}
          rx={10}
          fill="none"
          stroke="oklch(0.75 0.14 78)"
          strokeWidth={2}
        />
      </svg>

      <motion.div
        key={`${stepIndex}-${safePageIndex}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="panel-industrial pointer-events-auto absolute rounded-lg p-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        style={{ top: panel.top, left: panel.left, width: panel.width }}
      >
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-primary/80">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="h-3 w-3" /> Hướng dẫn
          </span>
          <span>
            Bước {stepIndex + 1}/{totalSteps}
            {pages.length > 1 ? ` · ${safePageIndex + 1}/${pages.length}` : ""}
          </span>
        </div>
        <h3 id="tutorial-title" className="mt-2 font-display text-lg text-gold">
          {page.title}
        </h3>
        <p
          id="tutorial-body"
          aria-live="polite"
          className="mt-2 text-sm leading-relaxed text-foreground/90"
        >
          {bodyText}
        </p>
        {page.learnMoreAnchor ? (
          <Link
            to="/how-to-play"
            hash={page.learnMoreAnchor}
            target="_blank"
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary/80 hover:text-gold"
          >
            <ExternalLink className="h-3 w-3" /> Tìm hiểu thêm
          </Link>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={onSkip}
            className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-destructive/60 hover:text-destructive"
          >
            <SkipForward className="h-3 w-3" /> Bỏ qua
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={isFirstOfAll}
              className="flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
            </button>
            {!isLastPage ? (
              <button
                onClick={onNext}
                className="flex items-center gap-1 rounded bg-gold px-3 py-1.5 text-xs font-semibold text-[oklch(0.15_0.01_60)] hover:brightness-110"
              >
                Xem chỉ số tiếp theo <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : advance === "manual" ? (
              <button
                onClick={onNext}
                className="flex items-center gap-1 rounded bg-gold px-3 py-1.5 text-xs font-semibold text-[oklch(0.15_0.01_60)] hover:brightness-110"
              >
                Tiếp tục <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="rounded border border-primary/50 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                Chờ thao tác
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HintOverlay({
  id,
  viewport,
  onClose,
}: {
  id: string;
  viewport: { w: number; h: number };
  onClose: () => void;
}) {
  const hint = hintFor(id as never);
  const rect = useTargetRect(hint.target, [id]);
  const fallback = { top: viewport.h - 220, left: viewport.w / 2 - 170, width: 340 };
  const panel = rect ? panelPosition(rect, "auto", viewport) : fallback;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-live="polite"
        className="panel-industrial pointer-events-auto fixed z-40 rounded-lg border-l-4 border-l-primary p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        style={{ top: panel.top, left: panel.left, width: panel.width }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary/80">
            <Lightbulb className="h-3 w-3" /> Gợi ý theo tình huống
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng gợi ý"
            className="rounded p-1 text-muted-foreground hover:bg-panel-elevated hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <h4 className="mt-1.5 font-display text-base text-gold">{hint.title}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{hint.body}</p>
        <div className="mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded border border-border bg-panel-elevated px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Đã hiểu
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function SkipConfirm({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="panel-industrial w-full max-w-sm rounded-lg p-5">
        <h3 className="font-display text-lg text-gold">Bỏ qua hướng dẫn?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Bạn sẽ không thấy hướng dẫn này ở những ván sau. Bạn có thể mở lại từ trang Hướng dẫn.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Tiếp tục hướng dẫn
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}

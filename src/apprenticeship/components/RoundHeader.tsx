import { Link } from "@tanstack/react-router";
import { Check, Lock, X } from "lucide-react";
import type { ApprenticeshipState, RoundId } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  state: ApprenticeshipState;
  onGoto: (r: RoundId, dev?: boolean) => void;
}

const ROUND_LABELS: Record<RoundId, string> = {
  1: "Hàng hóa",
  2: "Giá trị",
  3: "Ngày làm",
  4: "Máy móc",
  5: "Thị trường",
  6: "Tích lũy",
};

export function RoundHeader({ state, onGoto }: Props) {
  const isDev = import.meta.env.DEV;
  return (
    <header className="border-b border-border/60 bg-panel/60">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-lg uppercase tracking-[0.3em] text-gold">Ca học việc</h1>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Chặng {state.currentRound}/6
          </span>
        </div>
        <Link
          to="/"
          className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-primary/40 hover:text-gold"
        >
          <X className="h-3 w-3" /> Thoát
        </Link>
      </div>
      <nav
        aria-label="Tiến trình sáu chặng học việc"
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-6 pb-3"
      >
        {([1, 2, 3, 4, 5, 6] as RoundId[]).map((r, i) => {
          const round = state.rounds[r];
          const unlocked = r <= state.unlockedUpTo;
          const isCurrent = r === state.currentRound;
          const clickable = unlocked || isDev;
          return (
            <div key={r} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => clickable && onGoto(r, isDev && !unlocked)}
                disabled={!clickable}
                aria-label={`Chặng ${r}: ${ROUND_LABELS[r]}${round.completed ? " — hoàn thành" : unlocked ? "" : " — khóa"}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-left transition",
                  isCurrent && "border-primary/70 bg-primary/10 text-gold",
                  !isCurrent &&
                    unlocked &&
                    "border-border/50 bg-panel/40 text-foreground hover:border-primary/40",
                  !unlocked && "border-border/30 bg-panel/20 text-muted-foreground/60",
                  clickable ? "cursor-pointer" : "cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                    isCurrent && "border-primary bg-primary/20 text-gold",
                    round.completed && "border-success/70 bg-success/20 text-success",
                    !isCurrent && !round.completed && "border-border/60",
                  )}
                >
                  {round.completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : !unlocked && !isDev ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    r
                  )}
                </span>
                <span className="hidden font-mono text-[10px] uppercase tracking-widest md:inline">
                  {ROUND_LABELS[r]}
                </span>
              </button>
              {i < 5 && <span className="h-px w-3 bg-border/50" aria-hidden />}
            </div>
          );
        })}
      </nav>
    </header>
  );
}

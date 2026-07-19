import type { Phase } from "../types";
import { cn } from "@/lib/utils";

type VisualStep = 1 | 2 | 3;

const STEP_LABELS: Record<VisualStep, string> = {
  1: "Thử nghiệm",
  2: "Giải thích",
  3: "Kiểm tra",
};

export function phaseToStep(phase: Phase): VisualStep {
  if (phase === "brief" || phase === "interact" || phase === "simulate") return 1;
  if (phase === "eureka") return 2;
  return 3;
}

interface Props {
  currentPhase: Phase;
}

export function PhaseIndicator({ currentPhase }: Props) {
  const currentStep = phaseToStep(currentPhase);
  return (
    <nav aria-label="Tiến trình ba bước của chặng" className="flex items-center gap-1">
      {([1, 2, 3] as VisualStep[]).map((step, i) => {
        const isCurrent = step === currentStep;
        const isPast = step < currentStep;
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition",
                isCurrent && "border-primary/60 bg-primary/15 text-gold",
                isPast && "border-success/40 bg-success/10 text-success",
                !isCurrent && !isPast && "border-border/40 bg-panel/30 text-muted-foreground/60",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                  isCurrent && "bg-primary/30 text-gold",
                  isPast && "bg-success/20 text-success",
                  !isCurrent && !isPast && "bg-border/30",
                )}
              >
                {isPast ? "✓" : step}
              </span>
              {STEP_LABELS[step]}
            </div>
            {i < 2 && (
              <span
                className={cn("h-px w-3", step < currentStep ? "bg-success/40" : "bg-border/40")}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

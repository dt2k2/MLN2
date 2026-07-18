import { Sparkles } from "lucide-react";
import type { ApprenticeshipConceptId } from "../types";
import { useFocusPhaseHeading } from "../hooks/useFocusPhaseHeading";
import { PhaseIndicator } from "./PhaseIndicator";
import type { Phase } from "../types";

interface ConceptItem {
  id: ApprenticeshipConceptId;
  title: string;
  explanation: string;
}

interface Props {
  concepts: ConceptItem[];
  onContinue: () => void;
  focusKey: string;
  currentPhase: Phase;
}

export function EurekaPanel({ concepts, onContinue, focusKey, currentPhase }: Props) {
  const ref = useFocusPhaseHeading<HTMLHeadingElement>(focusKey);
  const heading =
    concepts.length === 1
      ? concepts[0].title
      : `${concepts.length} khái niệm vừa được khám phá`;
  return (
    <aside
      aria-live="polite"
      className="flex h-full flex-col gap-4 rounded-lg border border-primary/50 bg-primary/5 p-5 shadow-[0_0_40px_-15px_oklch(0.55_0.13_60/0.6)]"
    >
      <PhaseIndicator currentPhase={currentPhase} />
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">
          <Sparkles className="h-3 w-3" /> Những gì bạn vừa quan sát được gọi là…
        </div>
        <h2
          ref={ref}
          tabIndex={-1}
          className="mt-1 font-display text-xl text-gold outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {heading}
        </h2>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto">
        {concepts.map((c) => (
          <div key={c.id} className="rounded-md border border-border/50 bg-panel/40 p-3">
            <div className="font-display text-sm text-gold">{c.title}</div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85">{c.explanation}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
      >
        Tiếp tục — kiểm tra nhanh
      </button>
    </aside>
  );
}

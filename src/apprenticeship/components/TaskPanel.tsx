import type { ReactNode } from "react";
import { useFocusPhaseHeading } from "../hooks/useFocusPhaseHeading";
import { PhaseIndicator } from "./PhaseIndicator";
import type { Phase } from "../types";

interface Props {
  title: string;
  subtitle?: string;
  hints: string[];
  children?: ReactNode;
  action?: ReactNode;
  focusKey: string;
  currentPhase: Phase;
}

export function TaskPanel({ title, subtitle, hints, children, action, focusKey, currentPhase }: Props) {
  const ref = useFocusPhaseHeading<HTMLHeadingElement>(focusKey);
  return (
    <aside className="flex h-full flex-col gap-4 rounded-lg border border-border/60 bg-panel/70 p-5">
      <PhaseIndicator currentPhase={currentPhase} />
      <div>
        {subtitle && (
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/70">
            {subtitle}
          </div>
        )}
        <h2
          ref={ref}
          tabIndex={-1}
          className="mt-1 font-display text-xl text-gold outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {title}
        </h2>
      </div>
      <ul className="space-y-2 text-sm leading-relaxed text-foreground/85">
        {hints.slice(0, 3).map((h, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      {children && <div className="flex-1">{children}</div>}
      {action && <div className="mt-auto flex flex-col gap-2">{action}</div>}
    </aside>
  );
}

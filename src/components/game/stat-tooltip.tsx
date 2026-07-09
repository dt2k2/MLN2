import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CONCEPT_INFO, type ConceptKey } from "@/game/concepts";
import { useGameStore } from "@/game/state";

export function StatTooltip({
  conceptKey,
  children,
}: {
  conceptKey: ConceptKey;
  children: React.ReactNode;
}) {
  const state = useGameStore((s) => s.state);
  const info = CONCEPT_INFO[conceptKey];
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div className="h-full">{children}</div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs border border-primary/40 bg-[oklch(0.16_0.008_60)] p-0 text-foreground shadow-xl"
      >
        <div className="border-b border-border/60 px-3 py-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Khái niệm
          </div>
          <div className="font-display text-sm font-semibold text-gold">
            {info.title} <span className="ml-1 font-mono text-xs text-primary/70">({info.short})</span>
          </div>
        </div>
        <div className="space-y-2 px-3 py-2 text-[11px] leading-relaxed">
          <p className="text-foreground/90">{info.definition}</p>
          <p className="rounded border border-border/50 bg-panel-elevated/60 px-2 py-1 font-mono text-[10px] text-gold">
            {info.formula}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground/80">Bối cảnh: </span>
            {info.context(state)}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

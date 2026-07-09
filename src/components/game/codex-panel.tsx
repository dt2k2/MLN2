import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import { CONCEPT_INFO, type ConceptKey } from "@/game/concepts";
import { useGameStore } from "@/game/state";

export function CodexPanel({
  open,
  conceptKey,
  onClose,
  discoveredAt,
}: {
  open: boolean;
  conceptKey: ConceptKey | null;
  onClose: () => void;
  discoveredAt?: { quarter: number; year: number };
}) {
  const state = useGameStore((s) => s.state);
  const info = conceptKey ? CONCEPT_INFO[conceptKey] : null;
  return (
    <AnimatePresence>
      {open && info ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="panel-industrial fixed inset-x-3 bottom-3 z-40 h-[200px] rounded-xl border border-primary/50 shadow-[0_-20px_60px_oklch(0_0_0/0.6)]"
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:bg-panel-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid h-full grid-cols-[220px_1fr_1fr] gap-4 p-4">
            <div className="flex flex-col justify-between rounded-md border border-primary/40 bg-[oklch(0.14_0.01_60)] p-3">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Codex
                </span>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-gold">{info.title}</div>
                <div className="font-mono text-xs text-primary/70">{info.short}</div>
              </div>
              <div className="rounded border border-border/60 bg-panel-elevated/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                Lần khám phá: Quý {discoveredAt?.quarter ?? state.quarter}, {discoveredAt?.year ?? state.year}
              </div>
            </div>
            <div className="min-w-0 space-y-2 overflow-y-auto pr-2 text-[12px] leading-relaxed">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Định nghĩa
              </div>
              <p className="text-foreground/90">{info.definition}</p>
              <div className="rounded border border-primary/30 bg-panel-elevated/60 px-2 py-1 font-mono text-[11px] text-gold">
                {info.formula}
              </div>
            </div>
            <div className="min-w-0 space-y-3 overflow-y-auto pr-2 text-[12px] leading-relaxed">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Trích dẫn
                </div>
                <blockquote className="mt-1 border-l-2 border-gold/60 pl-3 italic text-foreground/85">
                  {info.quote}
                </blockquote>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Trong ván này
                </div>
                <p className="mt-1 text-foreground/85">{info.context(state)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

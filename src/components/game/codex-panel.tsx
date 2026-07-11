import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, LockKeyhole, X } from "lucide-react";
import { CONCEPT_INFO, CONCEPT_KEYS } from "@/game/concepts";
import { useGameStore } from "@/game/state";
import type { ConceptKey } from "@/game/types";

export function CodexPanel({
  open,
  conceptKey,
  onSelect,
  onClose,
}: {
  open: boolean;
  conceptKey: ConceptKey | null;
  onSelect: (key: ConceptKey) => void;
  onClose: () => void;
}) {
  const state = useGameStore((store) => store.state);
  const discovered = state.discoveredConcepts;
  const selected = conceptKey ? discovered[conceptKey] : undefined;
  const info = selected ? CONCEPT_INFO[selected.key] : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="panel-industrial fixed inset-x-3 bottom-3 z-40 h-[min(78vh,620px)] rounded-lg border border-primary/50 shadow-[0_-20px_60px_oklch(0_0_0/0.6)]"
        >
          <button
            onClick={onClose}
            title="Đóng Codex"
            className="absolute right-3 top-3 z-10 rounded p-1 text-muted-foreground hover:bg-panel-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr] md:grid-cols-[280px_1fr] md:grid-rows-1">
            <aside className="min-h-0 border-b border-border/60 p-4 md:border-b-0 md:border-r">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Nhật ký tư bản · {Object.keys(discovered).length}/15
                </span>
              </div>
              <div className="mt-3 grid max-h-[190px] grid-cols-3 gap-1.5 overflow-y-auto md:max-h-[calc(100%-32px)] md:grid-cols-1">
                {CONCEPT_KEYS.map((key, index) => {
                  const unlocked = !!discovered[key];
                  const selectedClass =
                    conceptKey === key
                      ? "border-primary bg-primary/10 text-gold"
                      : "border-border text-foreground hover:border-primary/60";
                  return (
                    <button
                      key={key}
                      disabled={!unlocked}
                      onClick={() => onSelect(key)}
                      className={`flex min-h-10 items-center gap-2 rounded border px-2 py-1.5 text-left text-xs transition ${
                        unlocked
                          ? selectedClass
                          : "cursor-not-allowed border-border/40 text-muted-foreground/50"
                      }`}
                    >
                      <span className="w-5 shrink-0 font-mono text-[10px]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {unlocked ? (
                        <span className="min-w-0 truncate">{CONCEPT_INFO[key].title}</span>
                      ) : (
                        <>
                          <LockKeyhole className="h-3 w-3 shrink-0" />
                          <span>?</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>
            <main className="min-h-0 overflow-y-auto p-5 pr-10">
              {info && selected ? (
                <div className="mx-auto max-w-3xl space-y-4">
                  <div>
                    <div className="font-display text-2xl font-bold text-gold">{info.title}</div>
                    <div className="font-mono text-xs text-primary/70">{info.short}</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Khám phá ở lượt {selected.turn} · Quý {selected.quarter}, {selected.year}
                  </div>
                  <div className="border-l-2 border-primary/60 pl-3 text-sm">
                    <p className="font-semibold text-foreground">{selected.action}</p>
                    <p className="mt-1 text-muted-foreground">{selected.consequence}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{info.definition}</p>
                  {info.formula ? (
                    <div className="rounded border border-primary/30 bg-panel-elevated px-3 py-2 font-mono text-xs text-gold">
                      {info.formula}
                    </div>
                  ) : null}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Trong ván này
                    </div>
                    <p className="mt-1 text-sm text-foreground/85">{info.context(state)}</p>
                  </div>
                  {info.quote ? (
                    <blockquote className="border-l-2 border-gold/60 pl-3 text-sm italic text-foreground/80">
                      “{info.quote.text}” — {info.quote.source}
                    </blockquote>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  Các mục sáng lên khi một hiện tượng xuất hiện trong xưởng.
                </div>
              )}
            </main>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

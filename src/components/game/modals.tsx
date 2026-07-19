import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Gear } from "./particles";
import { CONCEPT_INFO } from "@/game/concepts";
import type { ConceptDiscovery, ConceptKey, StoryPresentation } from "@/game/types";

export function ModalShell({
  open,
  onClose,
  children,
  maxWidth = "max-w-lg",
  closable = true,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  closable?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closable) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [closable, onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closable ? onClose : undefined}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Nội dung trò chơi"
            tabIndex={-1}
            className={`panel-industrial relative w-full ${maxWidth} rounded-xl p-0`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {closable ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng cửa sổ"
                className="absolute right-3 top-3 z-10 rounded p-1 text-muted-foreground hover:bg-panel-elevated hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export interface EventModalChoice {
  label: string;
  tone: "accept" | "refuse";
  previewLabel: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function EventModal({
  open,
  onClose,
  title,
  description,
  quarterLabel,
  choices,
  onChoose,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  quarterLabel: string;
  choices: EventModalChoice[];
  onChoose: (idx: number) => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose} closable={false}>
      <div className="relative h-32 overflow-hidden rounded-t-xl border-b border-border/60 bg-gradient-to-br from-[oklch(0.28_0.05_35)] to-[oklch(0.15_0.02_30)]">
        <div className="absolute -right-6 -top-6 text-destructive/40">
          <Gear size={140} slow />
        </div>
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-destructive">
            Sự kiện — {quarterLabel}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-col gap-2">
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onChoose(i)}
              disabled={c.disabled}
              className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                c.tone === "accept"
                  ? "border-[color:var(--success)]/60 bg-[color:var(--success)]/10 text-[color:var(--success)] hover:bg-[color:var(--success)]/20"
                  : "border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/20"
              }`}
            >
              <div>{c.label}</div>
              <div className="mt-1 font-mono text-[11px] font-normal opacity-80">
                {c.disabled ? c.disabledReason : c.previewLabel}
              </div>
            </button>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

export function StoryModal({
  open,
  onClose,
  story,
}: {
  open: boolean;
  onClose: () => void;
  story?: StoryPresentation;
}) {
  if (!story) return null;
  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-xl">
      <div className="border-b border-border/60 px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {story.eyebrow}
        </div>
        <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">{story.title}</h3>
      </div>
      <p className="px-6 py-5 text-sm leading-7 text-muted-foreground">{story.body}</p>
    </ModalShell>
  );
}

export function ConceptModal({
  open,
  onClose,
  discovery,
  series,
}: {
  open: boolean;
  onClose: () => void;
  discovery?: ConceptDiscovery;
  series?: { id: string; step: number; total: number };
}) {
  if (!discovery) return null;
  const info = CONCEPT_INFO[discovery.key];

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="flex items-center gap-3 border-b border-border/60 p-5">
        <div className="rounded-md border border-primary/40 bg-primary/10 p-2 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {series
              ? `Chu trình sản xuất đầu tiên · ${series.step}/${series.total}`
              : "Khoảnh khắc Eureka"}
          </div>
          <h3 className="font-display text-xl font-semibold text-gold">{info.title}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-[120px_1fr]">
        <div className="hidden items-center justify-center rounded border border-border bg-panel-elevated p-3 text-primary sm:flex">
          <Gear size={80} />
        </div>
        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-border bg-panel-elevated p-3">
            <p className="font-semibold text-foreground">{discovery.action}</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">{discovery.consequence}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Hiện tượng này được gọi là
            </div>
            <div className="mt-1 font-display text-lg font-semibold text-gold">
              {info.title} <span className="font-mono text-xs text-primary/70">({info.short})</span>
            </div>
          </div>
          <p className="leading-relaxed text-foreground/90">{info.definition}</p>
          {info.formula ? (
            <p className="rounded border border-primary/30 bg-panel-elevated px-3 py-2 font-mono text-xs text-gold">
              {info.formula}
            </p>
          ) : null}
          {info.quote ? (
            <blockquote className="border-l-2 border-gold/60 pl-3 text-xs italic text-muted-foreground">
              “{info.quote.text}” — {info.quote.source}
            </blockquote>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end border-t border-border/60 p-4">
        <button
          onClick={onClose}
          className="rounded-md bg-gold px-5 py-2 text-sm font-semibold transition hover:brightness-110"
        >
          Tiếp tục
        </button>
      </div>
    </ModalShell>
  );
}

export function EraRecapModal({
  open,
  onClose,
  startTurn,
  endTurn,
  conceptKeys,
}: {
  open: boolean;
  onClose: () => void;
  startTurn: number;
  endTurn: number;
  conceptKeys: ConceptKey[];
}) {
  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="border-b border-border/60 p-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Phán quyết lịch sử · Lượt {startTurn}–{endTurn}
        </div>
        <h3 className="font-display text-2xl font-semibold text-gold">
          Một thời kỳ sản xuất đã khép lại
        </h3>
      </div>
      <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">
        {conceptKeys.length > 0 ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Trong giai đoạn này, bạn đã trực tiếp chứng kiến:
            </p>
            {conceptKeys.map((key) => (
              <div key={key} className="border-l-2 border-primary/60 pl-3">
                <div className="font-display text-base font-semibold text-gold">
                  {CONCEPT_INFO[key].title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                  {CONCEPT_INFO[key].definition}
                </p>
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Xưởng đã vận hành thêm sáu lượt, nhưng chưa tạo ra một hiện tượng học thuật mới.
          </p>
        )}
      </div>
      <div className="border-t border-border/60 p-4">
        <button
          onClick={onClose}
          className="w-full rounded-md bg-gold px-5 py-3 font-display text-sm font-semibold uppercase tracking-widest transition hover:brightness-110"
        >
          Bước vào thời kỳ tiếp theo
        </button>
      </div>
    </ModalShell>
  );
}

export interface SummaryRow {
  label: string;
  value: string;
  tone: "up" | "down" | "warn";
}

export function TurnSummaryModal({
  open,
  onClose,
  title,
  rows,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  rows: SummaryRow[];
}) {
  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-xl">
      <div className="border-b border-border/60 p-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Tổng kết</div>
        <h3 className="font-display text-2xl font-semibold text-gold">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 p-5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded border border-border bg-panel-elevated px-3 py-2"
          >
            <span className="text-xs text-muted-foreground">{r.label}</span>
            <span
              className={`flex items-center gap-1 font-mono text-sm ${
                r.tone === "up"
                  ? "text-[color:var(--success)]"
                  : r.tone === "down"
                    ? "text-destructive"
                    : "text-[color:var(--contradiction)]"
              }`}
            >
              {r.tone === "up" ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 p-4">
        <button
          onClick={onClose}
          className="w-full rounded-md bg-gold px-5 py-3 font-display text-sm font-semibold uppercase tracking-widest transition hover:brightness-110"
        >
          Bước vào quý tiếp theo
        </button>
      </div>
    </ModalShell>
  );
}

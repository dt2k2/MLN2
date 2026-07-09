import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Gear } from "./particles";

export function ModalShell({
  open,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`panel-industrial relative w-full ${maxWidth} rounded-xl p-0`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded p-1 text-muted-foreground hover:bg-panel-elevated hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
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
    <ModalShell open={open} onClose={onClose}>
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
              className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
                c.tone === "accept"
                  ? "border-[color:var(--success)]/60 bg-[color:var(--success)]/10 text-[color:var(--success)] hover:bg-[color:var(--success)]/20"
                  : "border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/20"
              }`}
            >
              <div>{c.label}</div>
              <div className="mt-1 font-mono text-[11px] font-normal opacity-80">
                {c.previewLabel}
              </div>
            </button>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

export function ConceptModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="flex items-center gap-3 border-b border-border/60 p-5">
        <div className="rounded-md border border-primary/40 bg-primary/10 p-2 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Khái niệm
          </div>
          <h3 className="font-display text-xl font-semibold text-gold">
            Giá trị thặng dư (m)
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-5 p-6">
        <div className="flex items-center justify-center rounded border border-border bg-panel-elevated p-3 text-primary">
          <Gear size={80} />
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-foreground">
            <span className="font-mono text-gold">m = V′ − v</span>
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Giá trị thặng dư là phần giá trị mới do lao động sống của công nhân tạo ra, vượt quá
            giá trị sức lao động (v), bị nhà tư bản chiếm không. Tư bản bất biến (c — máy móc,
            nguyên liệu) chỉ chuyển giá trị của nó vào sản phẩm, không tạo ra giá trị mới.
          </p>
          <div className="rounded-md border border-border bg-panel-elevated p-3">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Quy luật xu hướng p′ giảm
            </div>
            <p className="leading-relaxed text-foreground">
              Khi bạn mua thêm máy, c tăng nhanh hơn v ⇒ cấu tạo hữu cơ c/v tăng ⇒ p′ = m′/(1+c/v)
              giảm — dù cường độ bóc lột m′ không đổi.
            </p>
          </div>
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
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Tổng kết
        </div>
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

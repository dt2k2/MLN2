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

export function EventModal({
  open,
  onClose,
  onAccept,
  onIgnore,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  onIgnore: () => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="relative h-40 overflow-hidden rounded-t-xl border-b border-border/60 bg-gradient-to-br from-[oklch(0.28_0.05_35)] to-[oklch(0.15_0.02_30)]">
        <div className="absolute -right-6 -top-6 text-destructive/40">
          <Gear size={140} slow />
        </div>
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-destructive">
            Sự kiện — Quý III / 1857
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl font-semibold text-foreground">
          Công nhân đình công
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sau ba quý làm việc 14 giờ mỗi ngày, công nhân xưởng dệt tổ chức đình công đòi giảm giờ làm và tăng lương. Mâu thuẫn giai cấp đang bộc lộ trực diện tại phân xưởng của bạn.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Sản xuất</div>
            <div className="mt-1 font-mono text-destructive">−28%</div>
          </div>
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Mâu thuẫn</div>
            <div className="mt-1 font-mono text-[color:var(--contradiction)]">+12</div>
          </div>
          <div className="rounded border border-border p-2">
            <div className="text-muted-foreground">Danh tiếng</div>
            <div className="mt-1 font-mono text-destructive">−5</div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 rounded-md border border-primary/60 bg-primary/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-primary/20"
          >
            Nhượng bộ (Chấp nhận)
          </button>
          <button
            onClick={onIgnore}
            className="flex-1 rounded-md border border-destructive/60 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
          >
            Đàn áp (Bỏ qua)
          </button>
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
            <span className="font-mono text-gold">m = W − (c + v)</span>
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Giá trị thặng dư là phần giá trị mới do lao động của công nhân tạo ra vượt quá giá trị sức lao động (v), bị nhà tư bản chiếm không.
          </p>
          <div className="rounded-md border border-border bg-panel-elevated p-3">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Ý nghĩa thực tiễn
            </div>
            <p className="leading-relaxed text-foreground">
              Kéo dài giờ làm hoặc tăng cường độ lao động sẽ nâng m, nhưng đồng thời làm gay gắt mâu thuẫn giữa tư bản và lao động.
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

export function TurnSummaryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const rows = [
    { label: "Doanh thu quý", value: "+ $42.800", tone: "up" as const },
    { label: "Chi phí bất biến (c)", value: "− $18.200", tone: "down" as const },
    { label: "Chi phí khả biến (v)", value: "− $9.500", tone: "down" as const },
    { label: "Lợi nhuận ròng", value: "+ $15.100", tone: "up" as const },
    { label: "Sức khoẻ công nhân", value: "− 4%", tone: "down" as const },
    { label: "Mâu thuẫn giai cấp", value: "+ 6", tone: "warn" as const },
  ];
  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-xl">
      <div className="border-b border-border/60 p-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Tổng kết
        </div>
        <h3 className="font-display text-2xl font-semibold text-gold">
          Kết thúc Quý — Lượt 8 / 24
        </h3>
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
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Stage } from "../components/Stage";
import { R2 } from "../numbers";
import { cn } from "@/lib/utils";

type Bucket = "transfer" | "advanced" | "source" | null;
interface Item {
  id: string;
  label: string;
  amount: number;
  correct: Exclude<Bucket, null>;
}

const ITEMS: Item[] = [
  { id: "mat", label: "Nguyên liệu", amount: R2.materials, correct: "transfer" },
  { id: "dep", label: "Hao mòn máy", amount: R2.depreciation, correct: "transfer" },
  { id: "wage", label: "Tiền lương", amount: R2.wage, correct: "advanced" },
  { id: "living", label: "Lao động sống", amount: R2.livingLaborValue, correct: "source" },
];

interface Props {
  onSimulate: () => void;
  running: boolean;
}

export function Round2Value({ onSimulate, running }: Props) {
  const reduce = useReducedMotion();
  const [placed, setPlaced] = useState<Record<string, Bucket>>({});

  const allPlaced = ITEMS.every((it) => placed[it.id]);
  const allCorrect = ITEMS.every((it) => placed[it.id] === it.correct);

  const place = (id: string, bucket: Exclude<Bucket, null>) => {
    setPlaced((p) => ({ ...p, [id]: bucket }));
  };

  return (
    <Stage
      resultTray={
        running ? (
          <div className="grid grid-cols-4 gap-3 text-center font-mono">
            <StatCell label="c" value={`$${R2.c}`} tone="muted" />
            <StatCell label="v" value={`$${R2.v}`} tone="info" />
            <StatCell label="m" value={`$${R2.m}`} tone="gold" />
            <StatCell label="Tổng giá trị H" value={`$${R2.total}`} tone="success" />
          </div>
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            {allPlaced ? "Bấm “Chạy dòng giá trị” để xem kết quả." : "Phân loại đủ 4 khoản trước."}
          </p>
        )
      }
    >
      <div className="flex w-full flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {ITEMS.map((it) => {
            const b = placed[it.id];
            return (
              <div
                key={it.id}
                className={cn(
                  "flex items-center justify-between rounded-md border bg-panel/60 px-3 py-2",
                  b ? "border-primary/40" : "border-border/60",
                )}
              >
                <div>
                  <div className="text-sm text-foreground">{it.label}</div>
                  <div className="font-mono text-xs text-muted-foreground">${it.amount}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => place(it.id, "transfer")}
                    className={cn(
                      "cursor-pointer rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition",
                      b === "transfer"
                        ? "border-primary bg-primary/20 text-gold"
                        : "border-border/60 text-muted-foreground hover:border-primary/40",
                    )}
                    aria-label={`${it.label} — chuyển giá trị cũ`}
                  >
                    Chuyển cũ
                  </button>
                  <button
                    type="button"
                    onClick={() => place(it.id, "advanced")}
                    className={cn(
                      "cursor-pointer rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition",
                      b === "advanced"
                        ? "border-primary bg-primary/20 text-gold"
                        : "border-border/60 text-muted-foreground hover:border-primary/40",
                    )}
                    aria-label={`${it.label} — tư bản ứng mua sức lao động`}
                  >
                    Ứng v
                  </button>
                  <button
                    type="button"
                    onClick={() => place(it.id, "source")}
                    className={cn(
                      "cursor-pointer rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition",
                      b === "source"
                        ? "border-primary bg-primary/20 text-gold"
                        : "border-border/60 text-muted-foreground hover:border-primary/40",
                    )}
                    aria-label={`${it.label} — nguồn tạo giá trị mới`}
                  >
                    Tạo mới
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Bucket
            title="Chuyển giá trị cũ (c)"
            items={ITEMS.filter((it) => placed[it.id] === "transfer")}
            tone="muted"
          />
          <Bucket
            title="Ứng mua sức lao động (v)"
            items={ITEMS.filter((it) => placed[it.id] === "advanced")}
            tone="info"
          />
          <Bucket
            title="Nguồn tạo giá trị mới"
            items={ITEMS.filter((it) => placed[it.id] === "source")}
            tone="gold"
          />
        </div>
        {allPlaced && !running && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            onClick={onSimulate}
            disabled={!allCorrect}
            className={cn(
              "self-center rounded-md border px-4 py-2 font-mono text-xs uppercase tracking-widest transition",
              allCorrect
                ? "cursor-pointer border-primary bg-primary/20 text-gold hover:bg-primary/30"
                : "cursor-not-allowed border-danger/40 bg-danger/10 text-danger",
            )}
          >
            {allCorrect ? "Chạy dòng giá trị" : "Phân loại chưa đúng — chỉnh lại"}
          </motion.button>
        )}
      </div>
    </Stage>
  );
}

function Bucket({
  title,
  items,
  tone,
}: {
  title: string;
  items: Item[];
  tone: "muted" | "info" | "gold";
}) {
  return (
    <div
      className={cn(
        "min-h-[80px] rounded-md border border-dashed p-3",
        tone === "gold"
          ? "border-primary/40 bg-primary/5"
          : tone === "info"
            ? "border-info/40 bg-info/5"
            : "border-border/50 bg-panel/30",
      )}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {items.length === 0 ? (
          <span className="font-mono text-[10px] text-muted-foreground/60">—</span>
        ) : (
          items.map((it) => (
            <span
              key={it.id}
              className="rounded bg-panel/70 px-2 py-1 font-mono text-[11px] text-foreground"
            >
              {it.label} ${it.amount}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "info" | "gold" | "success";
}) {
  const cls = {
    muted: "text-muted-foreground",
    info: "text-info",
    gold: "text-gold",
    success: "text-success",
  }[tone];
  return (
    <div className="rounded border border-border/40 bg-panel/50 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</div>
      <div className={`mt-1 font-mono text-base ${cls}`}>{value}</div>
    </div>
  );
}

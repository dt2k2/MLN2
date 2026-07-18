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
  amountNote?: string;
  correct: Exclude<Bucket, null>;
}

const ITEMS: Item[] = [
  {
    id: "mat",
    label: "Bông và thuốc nhuộm",
    amount: R2.materials,
    amountNote: "giá trị đã có",
    correct: "transfer",
  },
  {
    id: "dep",
    label: "Phần máy bị hao mòn",
    amount: R2.depreciation,
    amountNote: "giá trị đã có",
    correct: "transfer",
  },
  {
    id: "wage",
    label: "Tiền ứng trả lương",
    amount: R2.wage,
    amountNote: "ứng trước sản xuất",
    correct: "advanced",
  },
  {
    id: "living",
    label: "Lao động sống trong quý",
    amount: R2.livingLaborValue,
    amountNote: "giá trị mới tạo ra",
    correct: "source",
  },
];

interface Props {
  onSimulate: () => void;
  running: boolean;
}

export function Round2Value({ onSimulate, running }: Props) {
  const reduce = useReducedMotion();
  const [placed, setPlaced] = useState<Record<string, Bucket>>({});
  const [checked, setChecked] = useState(false);

  const allPlaced = ITEMS.every((it) => placed[it.id]);
  const correctCount = ITEMS.filter((it) => placed[it.id] === it.correct).length;
  const allCorrect = correctCount === ITEMS.length;

  const place = (id: string, bucket: Exclude<Bucket, null>) => {
    setPlaced((p) => ({ ...p, [id]: bucket }));
    // Reset checked state when player changes an answer
    if (checked) setChecked(false);
  };

  const checkPlacement = () => {
    setChecked(true);
  };

  const itemBorderClass = (it: Item): string => {
    if (!checked) return placed[it.id] ? "border-primary/40" : "border-border/60";
    return placed[it.id] === it.correct ? "border-success" : "border-danger";
  };

  return (
    <Stage
      resultTray={
        running ? (
          <ValueFormationResult />
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            {checked && !allCorrect
              ? `${correctCount}/4 đúng — sửa các dòng đỏ rồi kiểm tra lại.`
              : allPlaced
                ? "Bấm “Kiểm tra phân loại” khi đã sẵn sàng."
                : "Hãy phân loại đủ bốn yếu tố trước."}
          </p>
        )
      }
    >
      <div className="flex w-full flex-col gap-4">
        <div className="rounded-md border border-info/25 bg-info/5 px-3 py-2 text-xs leading-relaxed text-foreground/80">
          <strong className="text-info">Câu hỏi:</strong> yếu tố này chuyển giá trị đã có, là khoản
          tiền ứng để mua sức lao động, hay là hoạt động thực sự tạo ra giá trị mới?
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ITEMS.map((it) => {
            const b = placed[it.id];
            return (
              <div
                key={it.id}
                className={cn(
                  "flex items-center justify-between rounded-md border bg-panel/60 px-3 py-2",
                  itemBorderClass(it),
                )}
              >
                <div>
                  <div className="text-sm text-foreground">{it.label}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    ${it.amount}
                    {it.amountNote ? ` · ${it.amountNote}` : ""}
                  </div>
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
                    Chuyển giá trị
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
                    Ứng mua sức LĐ
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
                    Tạo giá trị mới
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <BucketBox
            title="Giá trị cũ chuyển vào vải (c)"
            items={ITEMS.filter((it) => placed[it.id] === "transfer")}
            tone="muted"
          />
          <BucketBox
            title="Tiền ứng mua sức lao động (v)"
            items={ITEMS.filter((it) => placed[it.id] === "advanced")}
            tone="info"
          />
          <BucketBox
            title="Nguồn tạo giá trị mới"
            items={ITEMS.filter((it) => placed[it.id] === "source")}
            tone="gold"
          />
        </div>
        {allPlaced && !running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            className="flex justify-center"
          >
            {checked && allCorrect ? (
              <button
                type="button"
                onClick={onSimulate}
                className="cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
              >
                Xem giá trị hình thành
              </button>
            ) : (
              <button
                type="button"
                onClick={checkPlacement}
                className={cn(
                  "cursor-pointer rounded-md border px-4 py-2 font-mono text-xs uppercase tracking-widest transition",
                  checked && !allCorrect
                    ? "border-danger/40 bg-danger/10 text-danger hover:bg-danger/15"
                    : "border-primary bg-primary/20 text-gold hover:bg-primary/30",
                )}
              >
                {checked && !allCorrect
                  ? `${correctCount}/4 đúng — kiểm tra lại`
                  : "Kiểm tra phân loại"}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </Stage>
  );
}

function BucketBox({
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

function ValueFormationResult() {
  return (
    <div className="flex items-center justify-center gap-2 text-center">
      <ValueBlock label="Giá trị cũ chuyển dịch" value={`c = $${R2.c}`} tone="muted" />
      <Operator>+</Operator>
      <div className="min-w-0 flex-1 rounded border border-primary/40 bg-primary/5 px-3 py-2">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Giá trị mới do lao động sống tạo ra
        </div>
        <div className="mt-0.5 font-mono text-base text-gold">${R2.livingLaborValue}</div>
        <div className="font-mono text-[10px] text-foreground/70">
          gồm <span className="text-info">v ${R2.v}</span> +
          <span className="text-gold"> m ${R2.m}</span>
        </div>
      </div>
      <Operator>=</Operator>
      <ValueBlock label="Tổng giá trị tấm vải" value={`$${R2.total}`} tone="success" />
    </div>
  );
}

function ValueBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "success";
}) {
  return (
    <div className="min-w-0 flex-1 rounded border border-border/40 bg-panel/50 px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-mono text-base",
          tone === "success" ? "text-success" : "text-muted-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Operator({ children }: { children: string }) {
  return <span className="shrink-0 font-mono text-lg text-foreground/50">{children}</span>;
}

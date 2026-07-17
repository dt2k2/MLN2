import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Stage } from "../components/Stage";
import { R3 } from "../numbers";

interface Props {
  onSimulate: () => void;
  running: boolean;
}

export function Round3Absolute({ onSimulate, running }: Props) {
  const reduce = useReducedMotion();
  const [hours, setHours] = useState(8);
  const necessary = R3.base.necessary;
  const surplus = Math.max(0, hours - necessary);
  const v = R3.wage;
  const m = surplus * (R3.wage / necessary); // = surplus * 10
  const mRate = m / v;

  const changed = hours > 8;

  return (
    <Stage
      resultTray={
        running || changed ? (
          <div className="grid grid-cols-4 gap-3 text-center font-mono">
            <Cell label="Ngày làm" value={`${hours}h`} tone="muted" />
            <Cell label="v" value={`$${v}`} tone="info" />
            <Cell label="m" value={`$${m.toFixed(0)}`} tone="gold" />
            <Cell label="m′" value={`${(mRate * 100).toFixed(0)}%`} tone={mRate > 1 ? "danger" : "success"} />
          </div>
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Kéo thanh giờ để xem timeline biến đổi.
          </p>
        )
      }
    >
      <div className="flex w-full flex-col gap-6">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Ngày lao động
            </span>
            <span className="font-mono text-2xl text-gold">{hours}h</span>
          </div>
          <input
            type="range"
            min={8}
            max={12}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            aria-label="Số giờ làm việc trong ngày"
            className="w-full cursor-pointer accent-primary"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>8h</span>
            <span>10h</span>
            <span>12h</span>
          </div>
        </div>
        <div className="rounded-md border border-border/60 bg-panel/40 p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Timeline
          </div>
          <div className="flex h-10 overflow-hidden rounded border border-border/60">
            <motion.div
              className="flex items-center justify-center bg-info/40 font-mono text-xs text-info-foreground"
              initial={false}
              animate={{ width: `${(necessary / hours) * 100}%` }}
              transition={{ duration: reduce ? 0 : 0.5 }}
            >
              tất yếu {necessary}h
            </motion.div>
            <motion.div
              className="flex items-center justify-center bg-primary/40 font-mono text-xs text-gold"
              initial={false}
              animate={{ width: `${(surplus / hours) * 100}%` }}
              transition={{ duration: reduce ? 0 : 0.5 }}
            >
              thặng dư {surplus}h
            </motion.div>
          </div>
        </div>
        {changed && !running && (
          <button
            type="button"
            onClick={onSimulate}
            className="self-center cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
          >
            Xác nhận ca kéo dài
          </button>
        )}
      </div>
    </Stage>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone: "muted" | "info" | "gold" | "success" | "danger" }) {
  const cls = {
    muted: "text-muted-foreground",
    info: "text-info",
    gold: "text-gold",
    success: "text-success",
    danger: "text-danger",
  }[tone];
  return (
    <div className="rounded border border-border/40 bg-panel/50 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</div>
      <div className={`mt-1 text-base ${cls}`}>{value}</div>
    </div>
  );
}

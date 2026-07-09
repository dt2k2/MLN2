import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { StatTooltip } from "./stat-tooltip";
import { showWarning } from "./achievement-toast";

export function ContradictionCard({
  value,
  unrest,
}: {
  value: number;
  unrest: number;
}) {
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current < 75 && value >= 75 && value < 100) {
      showWarning("⚠️ Nguy hiểm — Mâu thuẫn đang leo thang!");
    }
    prev.current = value;
  }, [value]);

  const danger = value > 60;
  const critical = value >= 100;

  return (
    <>
      <StatTooltip conceptKey="contradiction">
        <div
          className={`panel-industrial relative rounded-lg p-3 transition-colors ${
            danger ? "border-destructive/70 pulse-danger" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Mâu thuẫn giai cấp
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/70">Ngưỡng · 100</div>
          </div>
          <div className="mt-2 flex h-[110px] flex-col justify-center">
            <div className="mb-1 flex items-end justify-between">
              <span className="font-mono text-4xl text-[color:var(--contradiction)]">{value}</span>
              <span className="font-mono text-xs text-muted-foreground">/ 100</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded bg-panel-elevated">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded bg-gradient-to-r from-[color:var(--gold)] via-[color:var(--danger)] to-[color:var(--contradiction)]"
              />
              <div className="absolute inset-y-0 left-[75%] w-px bg-destructive/70" />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-[color:var(--contradiction)]" />
              Unrest hiện tại: {Math.round(unrest)}
            </div>
          </div>
        </div>
      </StatTooltip>
      <AnimatePresence>
        {critical ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[80] bg-destructive/60 mix-blend-multiply"
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

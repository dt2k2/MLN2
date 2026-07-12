import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { readScale, type ScalePhase } from "@/game/pressures";
import type { GameState } from "@/game/types";
import { StatTooltip } from "./stat-tooltip";
import { showWarning } from "./achievement-toast";

const PHASE_TONE: Record<ScalePhase, string> = {
  stable: "text-[color:var(--success)] border-[color:var(--success)]/40",
  accumulation: "text-gold border-gold/40",
  exploitation: "text-[color:var(--contradiction)] border-[color:var(--contradiction)]/50",
  crisis: "text-[color:var(--info)] border-[color:var(--info)]/50",
  rupture: "text-destructive border-destructive/70",
};

export function HistoricalScale({ state }: { state: GameState }) {
  const r = readScale(state);
  const stableCrack = useRef(0);
  // Hysteresis: crack only grows (doesn't fully heal)
  if (r.crackLevel > stableCrack.current) stableCrack.current = r.crackLevel;
  else stableCrack.current = Math.max(r.crackLevel, stableCrack.current - 0.02);
  const crack = stableCrack.current;

  const warned = useRef(false);
  useEffect(() => {
    if (!warned.current && crack >= 0.5) {
      warned.current = true;
      showWarning("Cán cân rạn — mâu thuẫn cơ bản của CNTB lộ diện.");
    }
  }, [crack]);

  const rotate = r.tilt * 0.6; // deg
  const jitter = Math.min(3, r.instability / 40);
  const capW = 22 + Math.min(28, r.capital * 0.35);
  const labW = 22 + Math.min(28, r.labor * 0.35);
  const capY = -rotate * 0.9;
  const labY = rotate * 0.9;

  const isRupture = r.phase === "rupture";
  const isCrisis = r.phase === "crisis";

  return (
    <StatTooltip conceptKey="capitalistContradiction">
      <div
        className={`panel-industrial relative overflow-hidden rounded-lg p-3 transition-colors ${
          isRupture ? "pulse-danger border-destructive/70" : ""
        }`}
        role="img"
        aria-label={`Cán cân lịch sử: ${r.phaseLabel}. Tư bản ${Math.round(r.capital)}, Lao động ${Math.round(r.labor)}, Thị trường ${Math.round(r.market)}.`}
      >
        {/* Header: phase badge + instability dots */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Cán cân lịch sử
          </div>
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full ${
                  r.instability / 40 > i
                    ? isRupture
                      ? "bg-destructive"
                      : "bg-[color:var(--contradiction)]"
                    : "bg-panel-elevated"
                }`}
              />
            ))}
          </div>
        </div>

        <div
          className={`mt-1 inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] ${PHASE_TONE[r.phase]}`}
        >
          {r.phaseLabel}
        </div>

        {/* SVG cán cân */}
        <motion.div
          animate={{
            x: [0, jitter, -jitter, 0],
            y: [0, -jitter * 0.5, jitter * 0.5, 0],
          }}
          transition={{
            duration: Math.max(0.3, 1.6 - r.instability / 120),
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-1 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 110" className="h-[110px] w-full">
            <defs>
              <linearGradient id="scale-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.18 0.01 60)" />
                <stop
                  offset="100%"
                  stopColor={isRupture ? "oklch(0.15 0.05 25)" : "oklch(0.12 0.01 60)"}
                />
              </linearGradient>
              <filter id="soft-glow">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>
            <rect x="0" y="0" width="200" height="110" fill="url(#scale-bg)" opacity="0.35" />

            {/* Đám đông silhouette khi rupture */}
            {isRupture ? (
              <g opacity="0.35">
                {Array.from({ length: 12 }).map((_, i) => {
                  const x = 110 + i * 7;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={92}
                      r={3}
                      fill="oklch(0.7 0.15 25)"
                      filter="url(#soft-glow)"
                    />
                  );
                })}
              </g>
            ) : null}

            {/* Trục (base) */}
            <rect x="94" y="80" width="12" height="20" fill="oklch(0.25 0.01 60)" />
            <polygon points="80,100 120,100 110,80 90,80" fill="oklch(0.28 0.01 60)" />

            {/* Vết nứt trên trục */}
            {crack > 0.02 ? (
              <path
                d="M100 82 L98 86 L102 90 L99 94 L101 100"
                stroke="oklch(0.75 0.18 25)"
                strokeWidth="1.2"
                fill="none"
                opacity={crack}
              />
            ) : null}

            {/* Beam group — xoay */}
            <motion.g
              animate={{ rotate }}
              transition={{ type: "spring", stiffness: 60, damping: 10 }}
              style={{ transformOrigin: "100px 78px" }}
            >
              {/* Beam */}
              <rect
                x="30"
                y="76"
                width="140"
                height="4"
                rx="2"
                fill="oklch(0.55 0.08 70)"
              />
              <circle cx="100" cy="78" r="3" fill="oklch(0.75 0.12 70)" />

              {/* Dây trái (Tư bản) */}
              <line
                x1="45"
                y1="78"
                x2="45"
                y2={40 + capY}
                stroke="oklch(0.45 0.05 70)"
                strokeWidth="1"
                strokeDasharray={state.debt > 0 ? "2 2" : undefined}
              />
              {/* Đĩa trái */}
              <g transform={`translate(${45 - capW / 2}, ${30 + capY})`}>
                <path
                  d={`M0 10 Q ${capW / 2} 20 ${capW} 10 L ${capW - 2} 6 L 2 6 Z`}
                  fill="oklch(0.35 0.08 80)"
                  stroke="var(--gold)"
                  strokeWidth="0.6"
                />
                {/* Coin stack */}
                <circle cx={capW / 2} cy={3} r={2} fill="var(--gold)" />
                <circle cx={capW / 2 - 3} cy={1} r={1.5} fill="var(--gold)" opacity="0.8" />
                {state.debt > 0 ? (
                  <rect x={capW / 2 + 2} y={-1} width="1" height="7" fill="oklch(0.5 0.1 25)" />
                ) : null}
              </g>
              <text
                x={45}
                y={30 + capY - 6}
                textAnchor="middle"
                fill="var(--gold)"
                fontSize="7"
                fontFamily="monospace"
              >
                TƯ BẢN
              </text>

              {/* Dây phải (Lao động) */}
              <line
                x1="155"
                y1="78"
                x2="155"
                y2={40 + labY}
                stroke="oklch(0.45 0.05 70)"
                strokeWidth="1"
              />
              {/* Đĩa phải */}
              <g transform={`translate(${155 - labW / 2}, ${30 + labY})`}>
                <path
                  d={`M0 10 Q ${labW / 2} 20 ${labW} 10 L ${labW - 2} 6 L 2 6 Z`}
                  fill="oklch(0.32 0.06 25)"
                  stroke="oklch(0.6 0.15 25)"
                  strokeWidth="0.6"
                />
                {/* Silhouettes */}
                <motion.g
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{
                    duration: Math.max(0.6, 2 - state.workHours / 12),
                    repeat: Infinity,
                  }}
                >
                  {Array.from({ length: Math.min(4, Math.max(2, Math.floor(state.workersActive / 20))) }).map(
                    (_, i, arr) => {
                      const step = labW / (arr.length + 1);
                      const x = step * (i + 1);
                      return (
                        <g key={i} transform={`translate(${x - 1}, 0)`}>
                          <circle cx={0} cy={0} r={1.2} fill="oklch(0.65 0.15 25)" />
                          <rect x={-1} y={1.2} width={2} height={3.5} fill="oklch(0.55 0.12 25)" />
                        </g>
                      );
                    },
                  )}
                </motion.g>
              </g>
              <text
                x={155}
                y={30 + labY - 6}
                textAnchor="middle"
                fill="oklch(0.75 0.15 25)"
                fontSize="7"
                fontFamily="monospace"
              >
                LAO ĐỘNG
              </text>
            </motion.g>

            {/* Hàng rơi khi khủng hoảng thừa */}
            {isCrisis
              ? [0, 1, 2].map((i) => (
                  <motion.rect
                    key={i}
                    x={40 + i * 4}
                    y={45}
                    width={3}
                    height={2}
                    fill="oklch(0.5 0.05 70)"
                    initial={{ y: 45, opacity: 0.9 }}
                    animate={{ y: 100, opacity: 0 }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeIn",
                    }}
                  />
                ))
              : null}
          </svg>
        </motion.div>

        {/* Mini bars */}
        <div className="mt-1 grid grid-cols-3 gap-1.5 font-mono text-[9px]">
          <PressureBar label="Tư bản" value={r.capital} color="var(--gold)" />
          <PressureBar
            label="Lao động"
            value={r.labor}
            color="oklch(0.65 0.18 25)"
          />
          <PressureBar label="Thị trường" value={r.market} color="var(--info)" />
        </div>
      </div>
    </StatTooltip>
  );
}

function PressureBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>{label}</span>
        <span style={{ color }}>{Math.round(value)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded bg-panel-elevated">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.6 }}
          className="h-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

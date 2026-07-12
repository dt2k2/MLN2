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

export function HistoricalScale({
  state,
  variant = "card",
  fill = false,
}: {
  state: GameState;
  variant?: "card" | "hero";
  fill?: boolean;
}) {
  const r = readScale(state);
  const stableCrack = useRef(0);
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

  const isHero = variant === "hero";
  const rotate = r.tilt * (isHero ? 0.7 : 0.6);
  const jitter = Math.min(isHero ? 5 : 3, r.instability / (isHero ? 30 : 40));
  const capW = 22 + Math.min(28, r.capital * 0.35);
  const labW = 22 + Math.min(28, r.labor * 0.35);
  const capY = -rotate * 0.9;
  const labY = rotate * 0.9;

  const isRupture = r.phase === "rupture";
  const isCrisis = r.phase === "crisis";
  const isExploitation = r.phase === "exploitation";

  return (
    <StatTooltip
      conceptKey="capitalistContradiction"
      className={fill ? "min-h-[140px] flex-1" : "h-auto shrink-0"}
    >
      <div
        className={`panel-industrial relative overflow-hidden rounded-lg transition-colors ${
          isHero ? "flex flex-1 flex-col p-4" : fill ? "flex h-full flex-col p-3" : "p-3"
        } ${isRupture ? "pulse-danger border-destructive/70" : ""}`}
        role="img"
        aria-label={`Cán cân lịch sử: ${r.phaseLabel}. Tư bản ${Math.round(r.capital)}, Lao động ${Math.round(r.labor)}, Thị trường ${Math.round(r.market)}.`}
      >
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            className={`font-semibold uppercase tracking-[0.18em] text-muted-foreground ${
              isHero ? "text-xs" : "text-[10px]"
            }`}
          >
            Cán cân lịch sử
          </div>
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`rounded-full ${isHero ? "h-1.5 w-1.5" : "h-1 w-1"} ${
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
          className={`relative z-10 mt-1 inline-flex w-fit rounded border px-1.5 py-0.5 font-mono ${
            isHero ? "text-xs" : "text-[10px]"
          } ${PHASE_TONE[r.phase]}`}
        >
          {r.phaseLabel}
        </div>
        {isHero ? (
          <div className="relative z-10 mt-1 text-[11px] italic text-muted-foreground">
            {r.phaseHint}
          </div>
        ) : null}

        {/* SVG */}
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
          className={`relative z-10 mt-1 flex ${
            isHero || fill ? "min-h-0 flex-1 items-center" : "items-center"
          } justify-center`}
        >
          <svg
            viewBox={isHero ? "0 0 240 220" : "0 0 200 110"}
            className={`w-full ${
              isHero ? "h-full min-h-[240px]" : fill ? "h-full min-h-[110px]" : "h-[110px]"
            }`}
          >
            <defs>
              <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isRupture ? "oklch(0.18 0.08 25)" : "oklch(0.16 0.02 60)"}
                />
                <stop offset="60%" stopColor="oklch(0.12 0.01 60)" />
                <stop offset="100%" stopColor="oklch(0.09 0.01 60)" />
              </linearGradient>
              <radialGradient id="hs-glow" cx="50%" cy="40%" r="50%">
                <stop
                  offset="0%"
                  stopColor={
                    isRupture
                      ? "oklch(0.55 0.2 25 / 0.4)"
                      : isExploitation
                        ? "oklch(0.55 0.15 40 / 0.3)"
                        : "oklch(0.6 0.1 70 / 0.2)"
                  }
                />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="hs-glow-f">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>

            <rect
              x="0"
              y="0"
              width={isHero ? 240 : 200}
              height={isHero ? 220 : 110}
              fill="url(#hs-sky)"
              opacity="0.55"
            />
            <rect
              x="0"
              y="0"
              width={isHero ? 240 : 200}
              height={isHero ? 220 : 110}
              fill="url(#hs-glow)"
            />

            {isHero ? (
              <>
                {/* Nhà máy silhouette phía sau */}
                <g opacity="0.35" fill="oklch(0.08 0.01 60)">
                  <rect x="10" y="145" width="35" height="45" />
                  <rect x="18" y="130" width="6" height="18" />
                  <rect x="30" y="135" width="5" height="14" />
                  <rect x="195" y="150" width="35" height="40" />
                  <rect x="203" y="132" width="6" height="20" />
                  <rect x="215" y="138" width="5" height="14" />
                </g>
                {/* Khói */}
                <motion.circle
                  cx={21}
                  cy={125}
                  r={5}
                  fill="oklch(0.35 0.02 60)"
                  animate={{ y: [-2, -14, -2], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.circle
                  cx={206}
                  cy={128}
                  r={4}
                  fill="oklch(0.32 0.02 60)"
                  animate={{ y: [-2, -12, -2], opacity: [0.4, 0.05, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeOut", delay: 1 }}
                />
                {/* Tàn tro / đom đóm */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.circle
                    key={i}
                    cx={30 + i * 24}
                    cy={210}
                    r={0.8}
                    fill={isRupture ? "oklch(0.7 0.2 25)" : "oklch(0.7 0.15 70)"}
                    animate={{
                      y: [0, -80 - Math.random() * 60, -160],
                      opacity: [0, 0.9, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            ) : null}

            {/* Đám đông rupture */}
            {isRupture ? (
              <g opacity={isHero ? 0.55 : 0.35}>
                {Array.from({ length: isHero ? 20 : 12 }).map((_, i) => {
                  const spacing = isHero ? 10 : 7;
                  const startX = isHero ? 130 : 110;
                  const baseY = isHero ? 195 : 92;
                  const x = startX + i * spacing;
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={baseY}
                        r={isHero ? 3.5 : 3}
                        fill="oklch(0.7 0.15 25)"
                        filter="url(#hs-glow-f)"
                      />
                      {isHero ? (
                        <rect
                          x={x - 2}
                          y={baseY + 2}
                          width={4}
                          height={12}
                          fill="oklch(0.55 0.12 25)"
                          opacity="0.7"
                        />
                      ) : null}
                    </g>
                  );
                })}
              </g>
            ) : null}

            {/* Trục */}
            <g transform={isHero ? "translate(0, 60)" : "translate(0,0)"}>
              <rect
                x={isHero ? 112 : 94}
                y={80}
                width={isHero ? 16 : 12}
                height={isHero ? 40 : 20}
                fill="oklch(0.25 0.01 60)"
              />
              <polygon
                points={isHero ? "88,120 152,120 136,80 104,80" : "80,100 120,100 110,80 90,80"}
                fill="oklch(0.28 0.01 60)"
              />
              <polygon
                points={isHero ? "88,120 152,120 152,124 88,124" : "80,100 120,100 120,102 80,102"}
                fill="oklch(0.15 0.01 60)"
              />

              {/* Vết nứt */}
              {crack > 0.02 ? (
                <path
                  d={
                    isHero
                      ? "M120 82 L116 90 L124 98 L118 108 L122 118"
                      : "M100 82 L98 86 L102 90 L99 94 L101 100"
                  }
                  stroke="oklch(0.75 0.18 25)"
                  strokeWidth={isHero ? 1.6 : 1.2}
                  fill="none"
                  opacity={crack}
                />
              ) : null}

              {/* Beam */}
              <motion.g
                animate={{ rotate }}
                transition={{ type: "spring", stiffness: 60, damping: 10 }}
                style={{
                  transformOrigin: isHero ? "120px 78px" : "100px 78px",
                }}
              >
                <rect
                  x={isHero ? 30 : 30}
                  y={76}
                  width={isHero ? 180 : 140}
                  height={isHero ? 5 : 4}
                  rx={2}
                  fill="oklch(0.55 0.08 70)"
                />
                <circle
                  cx={isHero ? 120 : 100}
                  cy={78}
                  r={isHero ? 4 : 3}
                  fill="oklch(0.75 0.12 70)"
                />

                {/* Dây trái */}
                {(() => {
                  const leftX = isHero ? 50 : 45;
                  const rightX = isHero ? 190 : 155;
                  const panY = isHero ? 20 : 30;
                  return (
                    <>
                      <line
                        x1={leftX}
                        y1={78}
                        x2={leftX}
                        y2={panY + 10 + capY}
                        stroke="oklch(0.45 0.05 70)"
                        strokeWidth="1"
                        strokeDasharray={state.debt > 0 ? "2 2" : undefined}
                      />
                      <g transform={`translate(${leftX - capW / 2}, ${panY + capY})`}>
                        <path
                          d={`M0 10 Q ${capW / 2} 20 ${capW} 10 L ${capW - 2} 6 L 2 6 Z`}
                          fill="oklch(0.35 0.08 80)"
                          stroke="var(--gold)"
                          strokeWidth="0.7"
                        />
                        <circle cx={capW / 2} cy={3} r={2.2} fill="var(--gold)" />
                        <circle cx={capW / 2 - 3} cy={1} r={1.6} fill="var(--gold)" opacity="0.8" />
                        <circle cx={capW / 2 + 3} cy={0} r={1.4} fill="var(--gold)" opacity="0.6" />
                        {state.debt > 0 ? (
                          <>
                            <rect
                              x={capW / 2 + 4}
                              y={-2}
                              width={1.2}
                              height={9}
                              fill="oklch(0.5 0.12 25)"
                            />
                            <circle
                              cx={capW / 2 + 4.6}
                              cy={-2}
                              r={1.2}
                              fill="oklch(0.55 0.15 25)"
                            />
                          </>
                        ) : null}
                      </g>
                      <text
                        x={leftX}
                        y={panY + capY - 6}
                        textAnchor="middle"
                        fill="var(--gold)"
                        fontSize={isHero ? 9 : 7}
                        fontFamily="monospace"
                        letterSpacing="1"
                      >
                        TƯ BẢN
                      </text>

                      {/* Dây phải */}
                      <line
                        x1={rightX}
                        y1={78}
                        x2={rightX}
                        y2={panY + 10 + labY}
                        stroke="oklch(0.45 0.05 70)"
                        strokeWidth="1"
                      />
                      <g transform={`translate(${rightX - labW / 2}, ${panY + labY})`}>
                        <path
                          d={`M0 10 Q ${labW / 2} 20 ${labW} 10 L ${labW - 2} 6 L 2 6 Z`}
                          fill="oklch(0.32 0.06 25)"
                          stroke="oklch(0.6 0.15 25)"
                          strokeWidth="0.7"
                        />
                        <motion.g
                          animate={{ opacity: [0.85, 1, 0.85] }}
                          transition={{
                            duration: Math.max(0.6, 2 - state.workHours / 12),
                            repeat: Infinity,
                          }}
                        >
                          {Array.from({
                            length: Math.min(5, Math.max(2, Math.floor(state.workersActive / 15))),
                          }).map((_, i, arr) => {
                            const step = labW / (arr.length + 1);
                            const x = step * (i + 1);
                            return (
                              <g key={i} transform={`translate(${x - 1}, 0)`}>
                                <circle cx={0} cy={0} r={1.4} fill="oklch(0.65 0.15 25)" />
                                <rect
                                  x={-1.2}
                                  y={1.4}
                                  width={2.4}
                                  height={4}
                                  fill="oklch(0.55 0.12 25)"
                                />
                              </g>
                            );
                          })}
                        </motion.g>
                      </g>
                      <text
                        x={rightX}
                        y={panY + labY - 6}
                        textAnchor="middle"
                        fill="oklch(0.75 0.15 25)"
                        fontSize={isHero ? 9 : 7}
                        fontFamily="monospace"
                        letterSpacing="1"
                      >
                        LAO ĐỘNG
                      </text>
                    </>
                  );
                })()}
              </motion.g>
            </g>

            {/* Hàng rơi khi crisis */}
            {isCrisis
              ? [0, 1, 2, 3].map((i) => (
                  <motion.rect
                    key={i}
                    x={(isHero ? 44 : 40) + i * (isHero ? 5 : 4)}
                    y={isHero ? 90 : 45}
                    width={isHero ? 4 : 3}
                    height={isHero ? 3 : 2}
                    fill="oklch(0.5 0.05 70)"
                    initial={{ y: isHero ? 90 : 45, opacity: 0.9 }}
                    animate={{ y: isHero ? 200 : 100, opacity: 0 }}
                    transition={{
                      duration: 1.8,
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
        <div
          className={`relative z-10 mt-1 grid grid-cols-3 gap-1.5 font-mono ${
            isHero ? "text-[10px]" : "text-[9px]"
          }`}
        >
          <PressureBar label="Tư bản" value={r.capital} color="var(--gold)" />
          <PressureBar label="Lao động" value={r.labor} color="oklch(0.65 0.18 25)" />
          <PressureBar label="Thị trường" value={r.market} color="var(--info)" />
        </div>
      </div>
    </StatTooltip>
  );
}

function PressureBar({ label, value, color }: { label: string; value: number; color: string }) {
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

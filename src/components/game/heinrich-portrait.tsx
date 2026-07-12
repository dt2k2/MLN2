import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { readScale } from "@/game/pressures";
import type { GameState } from "@/game/types";

type Mood =
  | "content"
  | "greedy"
  | "stressed"
  | "worried"
  | "furious"
  | "defeated"
  | "triumphant";

const MOOD_META: Record<Mood, { label: string; tone: string; hint: string }> = {
  content: {
    label: "Hài lòng",
    tone: "text-[color:var(--success)] border-[color:var(--success)]/40",
    hint: "Xưởng vận hành trôi chảy.",
  },
  greedy: {
    label: "Tham lam",
    tone: "text-gold border-gold/40",
    hint: "Vốn đang chảy về, muốn thêm nữa.",
  },
  stressed: {
    label: "Căng thẳng",
    tone: "text-[color:var(--contradiction)] border-[color:var(--contradiction)]/40",
    hint: "Bóc lột đang bị đẩy tới giới hạn.",
  },
  worried: {
    label: "Lo âu",
    tone: "text-[color:var(--info)] border-[color:var(--info)]/40",
    hint: "Hàng làm ra không bán được.",
  },
  furious: {
    label: "Phẫn nộ",
    tone: "text-destructive border-destructive/60",
    hint: "Công nhân đang chống lại ông ta.",
  },
  defeated: {
    label: "Suy sụp",
    tone: "text-destructive border-destructive/70",
    hint: "Mâu thuẫn cơ bản đang bung ra.",
  },
  triumphant: {
    label: "Đắc thắng",
    tone: "text-gold border-gold/60",
    hint: "Kẻ chiến thắng trên thương trường.",
  },
};

const MONOLOGUES: Record<Mood, string[]> = {
  content: [
    "Một quý êm ả. Cứ thế mà tiến.",
    "Bọn công nhân biết điều là được.",
    "Sổ sách sạch, tay ta cũng sạch.",
  ],
  greedy: [
    "Còn thiếu một chiếc máy nữa thôi…",
    "Vay thêm đi. Thời cơ không chờ ai.",
    "Mỗi đồng bạc là một đồng nữa sinh sôi.",
  ],
  stressed: [
    "Kéo dài ca. Chúng phải theo kịp.",
    "Không có chỗ cho kẻ chậm chạp.",
    "Đồng hồ chạy — máy không được ngừng.",
  ],
  worried: [
    "Kho đầy… mà không ai mua.",
    "Sao thị trường lại lặng thế này?",
    "Giá đang trượt. Ta phải làm gì đây?",
  ],
  furious: [
    "Bọn chúng dám đình công?! Đuổi hết!",
    "Không ai được rời máy!",
    "Ta trả lương là ta có quyền.",
  ],
  defeated: [
    "Có lẽ… ta đã sai ở đâu đó.",
    "Marx… hắn nói đúng sao?",
    "Không còn gì để mất nữa.",
  ],
  triumphant: [
    "Cả thành phố này là của ta.",
    "Đối thủ ư? Chỉ còn là cái bóng.",
    "Đây mới là ý nghĩa của tự do.",
  ],
};

function pickMood(state: GameState): Mood {
  const r = readScale(state);
  if (r.phase === "rupture" || state.contradiction >= 85) return "defeated";
  if (state.unrest >= 70) return "furious";
  if (r.phase === "crisis" || state.overstockStreak >= 2) return "worried";
  if (r.phase === "exploitation" || state.workHours >= 13) return "stressed";
  if (state.marketShare >= 0.5 && state.last.profitRateReal > 0.15)
    return "triumphant";
  if (r.phase === "accumulation" || state.cash > 60000) return "greedy";
  return "content";
}

export function HeinrichPortrait({ state }: { state: GameState }) {
  const mood = useMemo(() => pickMood(state), [state]);
  const [line, setLine] = useState(() => MONOLOGUES[mood][0]);
  const prevMood = useRef<Mood>(mood);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (prevMood.current !== mood) {
      const arr = MONOLOGUES[mood];
      setLine(arr[Math.floor(Math.random() * arr.length)]);
      prevMood.current = mood;
    }
  }, [mood]);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setBlink(true);
      setTimeout(() => !cancelled && setBlink(false), 140);
      setTimeout(tick, 2600 + Math.random() * 3800);
    };
    const id = setTimeout(tick, 2000);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  const meta = MOOD_META[mood];
  const shake = mood === "furious" || mood === "defeated";

  return (
    <div
      className={`panel-industrial relative flex min-h-[320px] flex-col overflow-hidden rounded-lg p-3 lg:flex-1 ${
        mood === "defeated" ? "pulse-danger border-destructive/60" : ""
      }`}
      role="img"
      aria-label={`Heinrich đang ${meta.label.toLowerCase()}: ${meta.hint}`}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Heinrich · Chủ xưởng
        </div>
        <div className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] ${meta.tone}`}>
          {meta.label}
        </div>
      </div>

      <motion.div
        animate={shake ? { x: [0, -1.5, 1.5, -1, 1, 0] } : { y: [0, -1.2, 0] }}
        transition={{ duration: shake ? 0.5 : 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 mt-1 flex min-h-[240px] flex-1 items-center justify-center"
      >
        <svg viewBox="0 0 240 260" preserveAspectRatio="xMidYMid meet" className="h-auto w-full max-h-[380px]" aria-hidden="true">
          <defs>
            <linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={mood === "defeated" || mood === "furious" ? "oklch(0.2 0.08 25)" : mood === "triumphant" ? "oklch(0.28 0.1 75)" : "oklch(0.2 0.03 60)"} />
              <stop offset="100%" stopColor="oklch(0.1 0.01 60)" />
            </linearGradient>
            <radialGradient id="hp-vignette" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="oklch(0.06 0.005 60 / 0.7)" />
            </radialGradient>
            <linearGradient id="hp-skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={mood === "furious" ? "oklch(0.7 0.16 30)" : mood === "defeated" ? "oklch(0.62 0.04 55)" : "oklch(0.72 0.06 55)"} />
              <stop offset="100%" stopColor={mood === "furious" ? "oklch(0.55 0.15 25)" : "oklch(0.55 0.05 55)"} />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="240" height="260" fill="url(#hp-sky)" />

          <g opacity="0.85">
            <rect x="20" y="20" width="200" height="150" fill="oklch(0.14 0.02 60)" stroke="oklch(0.32 0.02 60)" strokeWidth="2" />
            <line x1="120" y1="20" x2="120" y2="170" stroke="oklch(0.32 0.02 60)" strokeWidth="2" />
            <line x1="20" y1="95" x2="220" y2="95" stroke="oklch(0.32 0.02 60)" strokeWidth="2" />
            <g fill="oklch(0.09 0.01 60)" opacity="0.9">
              <rect x="30" y="120" width="40" height="50" />
              <rect x="38" y="105" width="6" height="18" />
              <rect x="52" y="110" width="5" height="14" />
              <rect x="80" y="130" width="55" height="40" />
              <rect x="145" y="115" width="45" height="55" />
              <rect x="155" y="98" width="7" height="20" />
              <rect x="175" y="102" width="6" height="16" />
            </g>
            {[41, 158, 178].map((cx, i) => (
              <motion.circle key={i} cx={cx} cy={100} r={4}
                fill={mood === "defeated" ? "oklch(0.35 0.02 60)" : "oklch(0.4 0.02 60)"}
                animate={{ y: [0, -25, -50], opacity: [0.6, 0.3, 0], scale: [1, 1.4, 1.8] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }} />
            ))}
          </g>

          <rect x="0" y="230" width="240" height="30" fill="oklch(0.18 0.02 40)" />
          <rect x="0" y="228" width="240" height="3" fill="oklch(0.28 0.03 40)" />

          <g>
            <path d="M60 260 L70 200 Q120 175 170 200 L180 260 Z" fill="oklch(0.16 0.02 60)" stroke="oklch(0.08 0.01 60)" strokeWidth="1" />
            <path d="M105 200 L120 215 L135 200 L132 220 L108 220 Z" fill="oklch(0.85 0.01 90)" />
            <path d="M116 218 L124 218 L126 245 L120 252 L114 245 Z" fill="oklch(0.15 0.05 25)" />
            <rect x="112" y="185" width="16" height="18" fill="url(#hp-skin)" />
          </g>

          <g transform={mood === "defeated" ? "translate(0, 8) rotate(-4 120 155)" : mood === "triumphant" ? "translate(0, -4)" : ""}>
            <ellipse cx="120" cy="150" rx="34" ry="42" fill="url(#hp-skin)" stroke="oklch(0.35 0.04 55)" strokeWidth="1" />
            <ellipse cx="87" cy="152" rx="4" ry="7" fill="url(#hp-skin)" />
            <ellipse cx="153" cy="152" rx="4" ry="7" fill="url(#hp-skin)" />

            <path d="M88 132 Q92 108 120 108 Q148 108 152 132 Q148 122 138 120 Q128 118 120 122 Q110 126 100 124 Q92 124 88 132 Z" fill="oklch(0.14 0.02 40)" />
            <path d="M88 132 Q100 118 120 118 Q140 118 152 132" fill="none" stroke="oklch(0.08 0.01 40)" strokeWidth="1" />

            <Brows mood={mood} />
            <Eyes mood={mood} blink={blink} />

            <path d="M104 168 Q112 172 120 170 Q128 172 136 168 Q132 174 120 174 Q108 174 104 168 Z" fill="oklch(0.14 0.02 40)" />

            <Mouth mood={mood} />

            {mood === "stressed" ? (
              <motion.g animate={{ y: [0, 8, 8], opacity: [1, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                <path d="M155 138 Q152 145 155 150 Q158 145 155 138 Z" fill="oklch(0.7 0.12 240)" opacity="0.85" />
              </motion.g>
            ) : null}
            {mood === "furious" ? (
              <>
                <circle cx="98" cy="160" r="6" fill="oklch(0.6 0.2 25)" opacity="0.4" />
                <circle cx="142" cy="160" r="6" fill="oklch(0.6 0.2 25)" opacity="0.4" />
              </>
            ) : null}
          </g>

          {mood === "defeated" ? (
            <g fill="url(#hp-skin)" stroke="oklch(0.35 0.04 55)" strokeWidth="1">
              <path d="M92 180 Q100 155 118 160 L120 180 Q110 190 92 190 Z" />
              <path d="M148 180 Q140 155 122 160 L120 180 Q130 190 148 190 Z" />
            </g>
          ) : null}

          {mood === "furious" ? (
            <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <circle cx="70" cy="215" r="12" fill="url(#hp-skin)" stroke="oklch(0.35 0.04 55)" strokeWidth="1" />
              <path d="M64 213 L76 213 M64 217 L76 217" stroke="oklch(0.35 0.04 55)" strokeWidth="1" />
            </motion.g>
          ) : null}

          {mood === "greedy" ? (
            <motion.g animate={{ x: [0, 3, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
              <ellipse cx="95" cy="235" rx="14" ry="8" fill="url(#hp-skin)" />
              <ellipse cx="145" cy="235" rx="14" ry="8" fill="url(#hp-skin)" />
            </motion.g>
          ) : null}

          {mood === "worried" ? (
            <motion.g animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "180px 245px" }}>
              <path d="M170 232 L190 232 L186 244 L174 244 Z" fill="oklch(0.35 0.12 25)" opacity="0.7" />
              <path d="M170 232 L190 232 L188 235 L172 235 Z" fill="oklch(0.5 0.15 25)" />
              <rect x="179" y="244" width="2" height="6" fill="oklch(0.3 0.02 60)" />
              <rect x="174" y="250" width="12" height="2" fill="oklch(0.3 0.02 60)" />
            </motion.g>
          ) : null}

          {mood === "content" || mood === "triumphant" ? (
            <>
              <rect x="145" y="182" width="16" height="3" fill="oklch(0.25 0.05 40)" />
              <rect x="160" y="182" width="3" height="3" fill="oklch(0.75 0.15 30)" />
              <motion.circle cx={163} cy={180} r={2.5} fill="oklch(0.55 0.02 60)"
                animate={{ y: [-2, -20, -35], opacity: [0.7, 0.3, 0], scale: [1, 1.6, 2.2] }}
                transition={{ duration: 3, repeat: Infinity }} />
            </>
          ) : null}

          {mood === "greedy" || mood === "triumphant" ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.circle key={i} cx={40 + i * 32} cy={0} r={2} fill="var(--gold)"
                  animate={{ y: [0, 260], opacity: [0, 1, 0] }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.4, ease: "easeIn" }} />
              ))}
            </>
          ) : null}

          {mood === "defeated" ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.rect key={i} x={30 + i * 40} y={230} width={10} height={13} fill="oklch(0.75 0.02 90)"
                  animate={{
                    y: [230, 100, 230],
                    x: [30 + i * 40, 30 + i * 40 + (i % 2 ? 30 : -30), 30 + i * 40],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
                  opacity={0.6} />
              ))}
            </>
          ) : null}

          <rect x="0" y="0" width="240" height="260" fill="url(#hp-vignette)" />
        </svg>
      </motion.div>

      <div className="relative z-10 mt-1 min-h-[32px] text-[11px] italic leading-snug text-muted-foreground">
        <AnimatePresence mode="wait">
          <motion.p key={line} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.35 }}>
            "{line}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Brows({ mood }: { mood: Mood }) {
  const stroke = "oklch(0.14 0.02 40)";
  const paths: Record<Mood, [string, string]> = {
    content: ["M100 138 L114 137", "M126 137 L140 138"],
    greedy: ["M100 140 Q107 134 114 138", "M126 138 Q133 134 140 140"],
    stressed: ["M100 136 L114 140", "M126 140 L140 136"],
    worried: ["M100 134 Q107 140 114 136", "M126 136 Q133 140 140 134"],
    furious: ["M100 134 L116 142", "M124 142 L140 134"],
    defeated: ["M100 142 Q107 146 114 143", "M126 143 Q133 146 140 142"],
    triumphant: ["M100 138 Q107 132 114 138", "M126 138 Q133 132 140 138"],
  };
  const [l, r] = paths[mood];
  return (
    <g stroke={stroke} strokeWidth={3} fill="none" strokeLinecap="round">
      <path d={l} />
      <path d={r} />
    </g>
  );
}

function Eyes({ mood, blink }: { mood: Mood; blink: boolean }) {
  if (blink || mood === "defeated") {
    return (
      <g stroke="oklch(0.14 0.02 40)" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M100 152 L114 152" />
        <path d="M126 152 L140 152" />
      </g>
    );
  }
  if (mood === "greedy") {
    return (
      <>
        <g stroke="oklch(0.14 0.02 40)" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M100 150 Q107 154 114 150" />
          <path d="M126 150 Q133 154 140 150" />
        </g>
        <text x="103" y="154" fill="var(--gold)" fontSize="6" fontWeight="bold">$</text>
        <text x="129" y="154" fill="var(--gold)" fontSize="6" fontWeight="bold">$</text>
      </>
    );
  }
  if (mood === "furious") {
    return (
      <>
        <circle cx="107" cy="152" r="3.5" fill="oklch(0.95 0.01 90)" />
        <circle cx="133" cy="152" r="3.5" fill="oklch(0.95 0.01 90)" />
        <circle cx="107" cy="152" r="1.6" fill="oklch(0.15 0.02 40)" />
        <circle cx="133" cy="152" r="1.6" fill="oklch(0.15 0.02 40)" />
      </>
    );
  }
  const r = mood === "stressed" ? 3.2 : 2.6;
  const cy = mood === "worried" ? 154 : 152;
  return (
    <>
      <ellipse cx="107" cy={cy} rx={r + 0.6} ry={r} fill="oklch(0.95 0.01 90)" />
      <ellipse cx="133" cy={cy} rx={r + 0.6} ry={r} fill="oklch(0.95 0.01 90)" />
      <circle cx={mood === "worried" ? 106 : 107} cy={cy + (mood === "worried" ? 1 : 0)} r="1.4" fill="oklch(0.15 0.02 40)" />
      <circle cx={mood === "worried" ? 132 : 133} cy={cy + (mood === "worried" ? 1 : 0)} r="1.4" fill="oklch(0.15 0.02 40)" />
    </>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  const stroke = "oklch(0.2 0.04 25)";
  switch (mood) {
    case "content":
      return <path d="M110 182 Q120 186 130 182" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />;
    case "greedy":
      return <path d="M108 182 Q118 188 132 180" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />;
    case "stressed":
      return <path d="M110 184 L130 184" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />;
    case "worried":
      return <path d="M110 186 Q120 182 130 186" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />;
    case "furious":
      return (
        <>
          <ellipse cx="120" cy="186" rx="10" ry="5" fill="oklch(0.2 0.08 25)" />
          <path d="M112 184 L128 184" stroke="oklch(0.9 0.01 90)" strokeWidth="1" />
        </>
      );
    case "defeated":
      return <path d="M112 186 Q120 184 128 186" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />;
    case "triumphant":
      return (
        <>
          <path d="M106 180 Q120 194 134 180" fill="oklch(0.2 0.04 25)" stroke={stroke} strokeWidth="1.4" />
          <path d="M108 182 L132 182" stroke="oklch(0.95 0.01 90)" strokeWidth="1" />
        </>
      );
  }
}

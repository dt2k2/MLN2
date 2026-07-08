import { useMemo } from "react";

export function Embers({ count = 30, className = "" }: { count?: number; className?: string }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
        size: 1 + Math.random() * 2,
        i,
      })),
    [count],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {embers.map((e) => (
        <span
          key={e.i}
          className="absolute bottom-0 rounded-full bg-[oklch(0.78_0.16_60)] shadow-[0_0_6px_oklch(0.75_0.18_45)]"
          style={{
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            animation: `ember-float ${e.duration}s ease-in ${e.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Smoke({ className = "" }: { className?: string }) {
  const puffs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        left: 10 + i * 15 + Math.random() * 5,
        delay: i * 1.2,
        duration: 5 + Math.random() * 3,
        i,
      })),
    [],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {puffs.map((p) => (
        <span
          key={p.i}
          className="absolute bottom-1/2 h-16 w-16 rounded-full bg-[oklch(0.55_0.01_60)] blur-2xl"
          style={{
            left: `${p.left}%`,
            animation: `smoke-rise ${p.duration}s ease-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Gear({
  size = 80,
  className = "",
  reverse = false,
  slow = false,
}: {
  size?: number;
  className?: string;
  reverse?: boolean;
  slow?: boolean;
}) {
  const teeth = 12;
  const outer = size / 2;
  const inner = outer * 0.72;
  const hub = outer * 0.28;
  const points = Array.from({ length: teeth * 2 }, (_, i) => {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outer : inner;
    return `${outer + Math.cos(angle) * r},${outer + Math.sin(angle) * r}`;
  }).join(" ");
  const cls = reverse ? "animate-gear-reverse" : slow ? "animate-gear-slow" : "animate-gear";
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`${cls} ${className}`}
      aria-hidden
    >
      <polygon points={points} fill="currentColor" opacity="0.9" />
      <circle cx={outer} cy={outer} r={hub} fill="oklch(0.15 0.01 60)" />
      <circle cx={outer} cy={outer} r={hub * 0.4} fill="currentColor" opacity="0.6" />
    </svg>
  );
}
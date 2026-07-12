import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedNumber } from "./animated-number";

export function DashboardCard({
  label,
  symbol,
  value,
  prefix,
  suffix,
  decimals = 0,
  icon: Icon,
  tone = "default",
  hint,
  flashOnDrop = false,
}: {
  label: string;
  symbol?: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: LucideIcon;
  tone?: "default" | "gold" | "danger" | "success" | "info";
  hint?: string;
  flashOnDrop?: boolean;
}) {
  const toneColor = {
    default: "text-foreground",
    gold: "text-gold",
    danger: "text-destructive",
    success: "text-[color:var(--success)]",
    info: "text-[color:var(--info)]",
  }[tone];

  const prev = useRef(value);
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (flashOnDrop && value < prev.current - 0.001) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value, flashOnDrop]);

  return (
    <div
      className={`panel-industrial group relative h-full overflow-hidden rounded-lg p-4 transition-all hover:-translate-y-0.5 ${
        shake ? "animate-shake border-destructive/80" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
          {symbol ? (
            <div className="mt-0.5 truncate font-mono text-[11px] text-primary/70" title={symbol}>
              {symbol}
            </div>
          ) : null}
        </div>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" /> : null}
      </div>
      <div className={`mt-3 text-3xl font-semibold ${shake ? "text-destructive" : toneColor}`}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}

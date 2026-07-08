import type { LucideIcon } from "lucide-react";
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
}) {
  const toneColor = {
    default: "text-foreground",
    gold: "text-gold",
    danger: "text-destructive",
    success: "text-[color:var(--success)]",
    info: "text-[color:var(--info)]",
  }[tone];

  return (
    <div className="panel-industrial group relative overflow-hidden rounded-lg p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
          {symbol ? (
            <div className="mt-0.5 font-mono text-xs text-primary/70">{symbol}</div>
          ) : null}
        </div>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground/70" /> : null}
      </div>
      <div className={`mt-3 text-3xl font-semibold ${toneColor}`}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}
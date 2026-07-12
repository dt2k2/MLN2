import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Coins, Calendar, Factory, Landmark } from "lucide-react";
import { Gear } from "./particles";
import { AnimatedNumber } from "./animated-number";

export function GameHeader({
  turn,
  quarter,
  company,
  money,
  accumulationFund,
  debt,
  nextInterest,
  debtRatio,
  onPause,
}: {
  turn: number;
  quarter: string;
  company: string;
  money: number;
  accumulationFund: number;
  debt: number;
  nextInterest: number;
  debtRatio: number;
  onPause?: () => void;
}) {
  const hasDebt = debt > 0;
  return (
    <header className="panel-industrial flex min-h-16 shrink-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-2 lg:flex-nowrap lg:gap-6 lg:px-4">
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <span className="text-primary">
          <Gear size={28} />
        </span>
        <span className="hidden font-display text-lg font-bold tracking-widest text-gold md:inline">
          DAS KAPITALIST
        </span>
      </Link>

      <div className="order-3 grid w-full min-w-0 grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4 lg:order-none lg:flex lg:w-auto lg:flex-1 lg:items-center lg:gap-6">
        <HeaderStat icon={<Factory className="h-3.5 w-3.5" />} label="Hãng" value={company} />
        <HeaderStat
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Lượt"
          value={
            <span className="whitespace-nowrap">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={turn}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="inline-block font-mono"
                >
                  {turn}
                </motion.span>
              </AnimatePresence>
              <span className="text-muted-foreground"> / 24</span>
            </span>
          }
        />
        <HeaderStat icon={<Calendar className="h-3.5 w-3.5" />} label="Quý" value={quarter} />
        <HeaderStat
          icon={<Coins className="h-3.5 w-3.5 text-gold" />}
          label="Tiền mặt"
          value={<AnimatedNumber value={money} prefix="$" className="text-gold" />}
        />
        <HeaderStat
          icon={<Coins className="h-3.5 w-3.5 text-primary" />}
          label="Quỹ tích lũy"
          value={<AnimatedNumber value={accumulationFund} prefix="$" className="text-primary" />}
        />
        {hasDebt ? (
          <>
            <HeaderStat
              icon={<Landmark className="h-3.5 w-3.5" />}
              label="Dư nợ"
              value={
                <span className="whitespace-nowrap font-mono">
                  ${Math.round(debt).toLocaleString("vi-VN")}
                </span>
              }
            />
            <HeaderStat
              icon={<Landmark className="h-3.5 w-3.5" />}
              label="Lãi quý tới"
              value={
                <span className="whitespace-nowrap font-mono text-destructive">
                  ${Math.round(nextInterest).toLocaleString("vi-VN")}
                </span>
              }
            />
            <HeaderStat
              icon={<Landmark className="h-3.5 w-3.5" />}
              label="Nợ / Tài sản"
              value={
                <span className="whitespace-nowrap font-mono">{(debtRatio * 100).toFixed(0)}%</span>
              }
            />
          </>
        ) : null}
      </div>

      <button
        onClick={onPause}
        className="ml-auto flex shrink-0 items-center gap-2 rounded-md border border-border bg-panel-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary"
      >
        <Pause className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Tạm dừng</span>
      </button>
    </header>
  );
}

function HeaderStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="flex items-center gap-1 whitespace-nowrap text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </span>
      <span className="mt-0.5 truncate font-display text-sm text-foreground">{value}</span>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Pause, Coins, Calendar, Factory } from "lucide-react";
import { Gear } from "./particles";
import { AnimatedNumber } from "./animated-number";

export function GameHeader({
  turn,
  quarter,
  company,
  money,
  onPause,
}: {
  turn: number;
  quarter: string;
  company: string;
  money: number;
  onPause?: () => void;
}) {
  return (
    <header className="panel-industrial flex h-16 shrink-0 items-center justify-between gap-6 rounded-lg px-4">
      <Link to="/" className="flex items-center gap-3">
        <span className="text-primary">
          <Gear size={32} />
        </span>
        <span className="font-display text-xl font-bold tracking-widest text-gold">
          DAS KAPITALIST
        </span>
      </Link>

      <div className="flex items-center gap-6 text-xs">
        <HeaderStat icon={<Factory className="h-3.5 w-3.5" />} label="Xí nghiệp" value={company} />
        <HeaderStat
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Lượt"
          value={
            <span>
              <span className="font-mono">{turn}</span>
              <span className="text-muted-foreground"> / 24</span>
            </span>
          }
        />
        <HeaderStat icon={<Calendar className="h-3.5 w-3.5" />} label="Quý" value={quarter} />
        <HeaderStat
          icon={<Coins className="h-3.5 w-3.5 text-gold" />}
          label="Tư bản tiền tệ"
          value={<AnimatedNumber value={money} prefix="$" className="text-gold" />}
        />
      </div>

      <button
        onClick={onPause}
        className="flex items-center gap-2 rounded-md border border-border bg-panel-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary"
      >
        <Pause className="h-3.5 w-3.5" /> Tạm dừng
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
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </span>
      <span className="mt-0.5 font-display text-sm text-foreground">{value}</span>
    </div>
  );
}
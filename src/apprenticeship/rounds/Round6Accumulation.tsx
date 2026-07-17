import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cog, ShoppingBag, Wallet } from "lucide-react";
import { Stage } from "../components/Stage";
import { R6, accumulationFundAfterPurchase, computeR6 } from "../numbers";
import { cn } from "@/lib/utils";

interface Props {
  onSimulate: () => void;
  running: boolean;
}

export function Round6Accumulation({ onSimulate, running }: Props) {
  const reduce = useReducedMotion();
  const [ratio, setRatio] = useState<number>(50);
  const [bought, setBought] = useState(false);
  const b = computeR6(ratio);
  const availableFund = bought ? accumulationFundAfterPurchase(ratio) : b.fund;

  const buy = () => {
    if (!b.canBuyMachine || bought) return;
    setBought(true);
    onSimulate();
  };

  return (
    <Stage
      resultTray={
        <div className="grid grid-cols-4 gap-3 text-center font-mono">
          <Cell label="Chủ sở hữu rút" value={`$${b.ownerConsumption}`} tone="muted" />
          <Cell label="Giữ trong xưởng" value={`$${b.retained}`} tone="info" />
          <Cell
            label={bought ? "Quỹ còn lại" : "Quỹ giữ lại"}
            value={`$${availableFund}`}
            tone="gold"
          />
          <Cell
            label="Máy mới"
            value={bought ? "Đã mua ✓" : b.canBuyMachine ? "Sẵn sàng" : `Cần $${R6.machinePrice}`}
            tone={bought ? "success" : b.canBuyMachine ? "gold" : "danger"}
          />
        </div>
      }
    >
      <div className="flex w-full flex-col gap-5">
        <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Lợi nhuận kế toán quý này
          </div>
          <div className="mt-1 font-mono text-3xl text-gold">${R6.profit}</div>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Tỷ lệ giữ lại
            </span>
            <span className="font-mono text-2xl text-gold">{ratio}%</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {R6.ratios.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => !bought && setRatio(r)}
                disabled={bought}
                className={cn(
                  "rounded-md border py-2 font-mono text-sm transition",
                  ratio === r
                    ? "border-primary bg-primary/20 text-gold"
                    : "border-border/60 bg-panel/40 hover:border-primary/40",
                  bought ? "cursor-default" : "cursor-pointer",
                )}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FlowCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Chủ sở hữu tiêu dùng"
            value={`$${b.ownerConsumption}`}
          />
          <FlowCard
            icon={<Wallet className="h-5 w-5" />}
            label={bought ? "Quỹ còn lại" : "Quỹ giữ lại"}
            value={`$${availableFund}`}
            highlight
          />
          <motion.div
            animate={bought ? { scale: reduce ? 1 : [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.4 }}
          >
            <FlowCard
              icon={<Cog className="h-5 w-5" />}
              label="Máy mới"
              value={bought ? "+1 máy" : `$${R6.machinePrice}`}
              highlight={bought}
            />
          </motion.div>
        </div>
        {!bought && (
          <button
            type="button"
            onClick={buy}
            disabled={!b.canBuyMachine || running}
            className={cn(
              "self-center rounded-md border px-4 py-2 font-mono text-xs uppercase tracking-widest transition",
              b.canBuyMachine
                ? "cursor-pointer border-primary bg-primary/20 text-gold hover:bg-primary/30"
                : "cursor-not-allowed border-danger/40 bg-danger/10 text-danger",
            )}
          >
            {b.canBuyMachine
              ? "Dùng quỹ mua máy"
              : `Quỹ còn thiếu $${R6.machinePrice - b.retained}`}
          </button>
        )}
      </div>
    </Stage>
  );
}

function FlowCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-md border p-3 text-center",
        highlight
          ? "border-primary/50 bg-primary/5 text-gold"
          : "border-border/60 bg-panel/40 text-foreground",
      )}
    >
      <div>{icon}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-lg">{value}</div>
    </div>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "info" | "gold" | "success" | "danger";
}) {
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
      <div className={`mt-1 text-sm ${cls}`}>{value}</div>
    </div>
  );
}

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Stage } from "../components/Stage";
import { R5, computeR5, type R5Result } from "../numbers";
import { cn } from "@/lib/utils";

interface Props {
  onSimulate: () => void;
  running: boolean;
}

const INSIGHTS: Record<number, string> = {
  80: "Sản xuất thận trọng làm ít tiền bị giam trong kho hơn, nhưng cú giảm cầu vẫn để lại hàng chưa bán.",
  100: "Kế hoạch từng khớp cầu dự kiến vẫn có thể bị phá vỡ khi khả năng thanh toán của thị trường thay đổi.",
  140: "Sản xuất quá mức không làm giá trị biến mất ngay, nhưng giam nhiều vốn trong tồn kho và tạo thiếu hụt dòng tiền.",
};

export function Round5Overproduction({ onSimulate, running }: Props) {
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<R5Result | null>(null);

  const pick = (o: number) => {
    if (running) return;
    setChoice(o);
    setResult(null);
  };

  const runMarket = () => {
    if (choice === null || running) return;
    setResult(computeR5(choice));
    onSimulate();
  };

  return (
    <Stage
      resultTray={
        result ? (
          <div className="grid grid-cols-7 gap-2 text-center font-mono">
            <Cell label="m đã sản xuất" value={`$${result.produced.m}`} tone="muted" />
            <Cell label="Đã bán" value={`${result.sold} đơn vị`} tone="info" />
            <Cell label="Doanh thu" value={`$${result.revenue}`} tone="gold" />
            <Cell
              label="Lợi nhuận đã thực hiện"
              value={`$${result.accountingProfit}`}
              tone={result.accountingProfit >= 0 ? "success" : "danger"}
            />
            <Cell
              label="Dòng tiền của lô"
              value={`$${result.cashResult}`}
              tone={result.cashResult >= 0 ? "success" : "danger"}
            />
            <Cell
              label="Tồn kho"
              value={`${result.unsold} đơn vị`}
              tone={result.unsold > 0 ? "danger" : "muted"}
            />
            <Cell
              label="Vốn nằm trong kho"
              value={`$${result.inventoryBookValue}`}
              tone={result.inventoryBookValue > 0 ? "danger" : "muted"}
            />
          </div>
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Chọn một mức sản lượng.
          </p>
        )
      }
    >
      <div className="flex w-full flex-col gap-4">
        <div className="rounded-md border border-info/40 bg-info/5 p-3 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Cầu hiệu dụng dự kiến
          </div>
          <div className="mt-1 font-mono text-2xl text-info">{R5.effectiveDemand} đơn vị</div>
          {result && (
            <div className="mt-2 font-mono text-xs text-danger">
              Thị trường bất ngờ giảm cầu còn {R5.demandShock} đơn vị
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {R5.options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => pick(o)}
              disabled={running}
              className={cn(
                "rounded-md border p-4 text-center transition",
                choice === o
                  ? "border-primary bg-primary/20 text-gold"
                  : "border-border/60 bg-panel/50 hover:border-primary/50",
                running ? "cursor-default" : "cursor-pointer",
                running && choice !== o && "opacity-50",
              )}
            >
              <div className="font-mono text-2xl text-foreground">{o}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                đơn vị
              </div>
            </button>
          ))}
        </div>
        {choice !== null && !result && !running && (
          <button
            type="button"
            onClick={runMarket}
            className="cursor-pointer self-center rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
          >
            Cho thị trường vận động
          </button>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.4 }}
            className="space-y-3"
          >
            <div className="rounded-md border border-border/60 bg-panel/40 p-3">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Dòng chảy sản phẩm
              </div>
              <div className="flex h-8 overflow-hidden rounded border border-border/60">
                <div
                  className="flex items-center justify-center bg-success/40 font-mono text-xs text-success"
                  style={{ width: `${(result.sold / result.output) * 100}%` }}
                >
                  bán {result.sold}
                </div>
                {result.unsold > 0 && (
                  <div
                    className="flex items-center justify-center bg-danger/40 font-mono text-xs text-danger"
                    style={{ width: `${(result.unsold / result.output) * 100}%` }}
                  >
                    tồn {result.unsold}
                  </div>
                )}
              </div>
            </div>
            {choice !== null && INSIGHTS[choice] && (
              <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-center text-xs leading-relaxed text-foreground/85">
                {INSIGHTS[choice]}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Stage>
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

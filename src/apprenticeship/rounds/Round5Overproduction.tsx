import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Stage } from "../components/Stage";
import { R5, computeR5, type R5Result } from "../numbers";
import { cn } from "@/lib/utils";

interface Props {
  onSimulate: () => void;
  running: boolean;
}

export function Round5Overproduction({ onSimulate, running }: Props) {
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<R5Result | null>(null);

  const pick = (o: number) => {
    setChoice(o);
    setResult(null);
  };

  const runMarket = () => {
    if (choice !== R5.effectiveDemand) return;
    setResult(computeR5(choice));
    onSimulate();
  };

  return (
    <Stage
      resultTray={
        result ? (
          <div className="grid grid-cols-6 gap-2 text-center font-mono">
            <Cell label="m đã sản xuất" value={`$${result.produced.m}`} tone="muted" />
            <Cell label="Đã bán" value={`${result.sold} đv`} tone="info" />
            <Cell label="Doanh thu" value={`$${result.revenue}`} tone="gold" />
            <Cell
              label="Kết quả thực hiện"
              value={`$${result.realizedProfit}`}
              tone={result.realizedProfit >= 0 ? "success" : "danger"}
            />
            <Cell
              label="Tồn kho"
              value={`${result.unsold} đv`}
              tone={result.unsold > 0 ? "danger" : "muted"}
            />
            <Cell label="Tổng giá trị" value={`$${result.produced.totalValue}`} tone="muted" />
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
          <div className="mt-1 font-mono text-2xl text-info">{R5.effectiveDemand} đv</div>
          {result && (
            <div className="mt-2 font-mono text-xs text-danger">
              → Thị trường bất ngờ giảm cầu còn {R5.demandShock} đv
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {R5.options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => !running && pick(o)}
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
        {choice !== null && !result && (
          <div
            className={cn(
              "rounded-md border p-3 text-center text-xs leading-relaxed",
              choice === R5.effectiveDemand
                ? "border-success/40 bg-success/10 text-success"
                : "border-primary/40 bg-primary/5 text-foreground/80",
            )}
          >
            {choice === R5.effectiveDemand
              ? "Kế hoạch khớp với cầu dự kiến 100 đơn vị. Bây giờ hãy để thị trường vận động."
              : choice < R5.effectiveDemand
                ? "Mức này thận trọng nhưng bỏ lại một phần cầu dự kiến. Hãy thử lập kế hoạch đúng 100 đơn vị để cô lập tác động của cú sốc thị trường."
                : "Mức này đã vượt cầu dự kiến ngay từ đầu. Hãy thử lập kế hoạch 100 đơn vị để thấy khủng hoảng vẫn có thể xuất hiện dù kế hoạch ban đầu hợp lý."}
          </div>
        )}
        {choice === R5.effectiveDemand && !result && !running && (
          <button
            type="button"
            onClick={runMarket}
            className="self-center cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
          >
            Chạy thị trường
          </button>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.4 }}
            className="rounded-md border border-border/60 bg-panel/40 p-3"
          >
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

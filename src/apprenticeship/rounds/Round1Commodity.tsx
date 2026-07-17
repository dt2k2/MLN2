import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Coins, Factory, Package } from "lucide-react";
import { Stage } from "../components/Stage";

interface Props {
  onSimulate: () => void;
  running: boolean;
}

export function Round1Commodity({ onSimulate, running }: Props) {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState<"factory" | "cloth" | "market">("cloth");
  const [exchanged, setExchanged] = useState(false);

  useEffect(() => {
    if (running) {
      const t = setTimeout(
        () => {
          setPos("market");
          setExchanged(true);
        },
        reduce ? 0 : 700,
      );
      return () => clearTimeout(t);
    }
  }, [running, reduce]);

  const trigger = () => {
    if (!running) onSimulate();
  };

  return (
    <Stage
      resultTray={
        exchanged ? (
          <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
            <ResultCell label="Giá trị sử dụng" value="Vẫn còn" tone="muted" />
            <ResultCell label="Giao dịch" value="Thành công" tone="success" />
            <ResultCell label="Thu về" value="$38 / tấm" tone="gold" />
          </div>
        ) : null
      }
    >
      <div className="flex w-full items-center justify-between gap-8">
        <Station icon={<Factory className="h-8 w-8" />} label="Xưởng" />
        <div className="relative flex-1">
          <div className="mx-auto h-1 w-full max-w-[240px] rounded-full bg-border/50" />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            initial={{ left: "50%", x: "-50%" }}
            animate={{
              left: pos === "market" ? "100%" : "50%",
              x: pos === "market" ? "-100%" : "-50%",
            }}
            transition={{ duration: reduce ? 0 : 1.2, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-md border border-primary/60 bg-panel px-3 py-2 text-primary shadow-lg">
                <Package className="h-6 w-6" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tấm vải
              </span>
            </div>
          </motion.div>
        </div>
        <Station icon={<Coins className="h-8 w-8" />} label="Thị trường" />
      </div>
      {!running && !exchanged && (
        <button
          type="button"
          onClick={trigger}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer rounded-md border border-primary bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-gold transition hover:bg-primary/30"
        >
          <ArrowRight className="mr-1 inline h-3 w-3" /> Đưa ra trao đổi
        </button>
      )}
    </Stage>
  );
}

function Station({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex w-24 flex-col items-center gap-2 text-primary/80">
      <div className="rounded-lg border border-border/60 bg-panel p-4">{icon}</div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ResultCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "success" | "gold";
}) {
  const cls =
    tone === "success" ? "text-success" : tone === "gold" ? "text-gold" : "text-muted-foreground";
  return (
    <div className="rounded border border-border/40 bg-panel/50 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</div>
      <div className={`mt-1 text-sm ${cls}`}>{value}</div>
    </div>
  );
}

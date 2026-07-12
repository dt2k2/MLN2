import { useMemo } from "react";
import { produce } from "immer";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DECISIONS } from "@/game/decisions";
import { computeQuarter } from "@/game/engine/laws";
import type { DecisionOptionId, GameState } from "@/game/types";

type Metric = {
  key: string;
  label: string;
  before: number;
  after: number;
  kind: "money" | "pct" | "num";
};

function fmt(n: number, kind: Metric["kind"]) {
  if (kind === "pct") return `${(n * 100).toFixed(1)}%`;
  if (kind === "money") return `$${Math.round(n).toLocaleString("vi-VN")}`;
  return n.toFixed(2);
}

export function ActionPreview({
  state,
  actionId,
}: {
  state: GameState;
  actionId: DecisionOptionId;
}) {
  const metrics = useMemo<Metric[]>(() => {
    try {
      const next = produce(state, (d) => {
        DECISIONS[actionId].apply(d);
      });
      const before = computeQuarter(state);
      const after = computeQuarter(next);
      return [
        { key: "c", label: "Tư liệu", before: before.c, after: after.c, kind: "money" },
        { key: "v", label: "Lương", before: before.v, after: after.v, kind: "money" },
        { key: "m", label: "Dôi ra", before: before.m, after: after.m, kind: "money" },
        {
          key: "p",
          label: "Hiệu suất",
          before: before.profitRate,
          after: after.profitRate,
          kind: "pct",
        },
        {
          key: "k",
          label: "Xã hội",
          before: state.contradiction,
          after: next.contradiction,
          kind: "num",
        },
      ];
    } catch {
      return [];
    }
  }, [state, actionId]);

  return (
    <div className="rounded-md border border-primary/30 bg-[oklch(0.15_0.008_60)] p-2 text-[10px]">
      <div className="mb-1.5 font-semibold uppercase tracking-widest text-muted-foreground">
        Nếu bạn chọn hành động này:
      </div>
      <div className="grid grid-cols-5 gap-1">
        {metrics.map((m) => {
          const delta = m.after - m.before;
          const eps = m.kind === "pct" ? 0.0005 : m.kind === "money" ? 50 : 0.5;
          const tone =
            Math.abs(delta) < eps
              ? "flat"
              : m.key === "k"
                ? delta > 0
                  ? "down"
                  : "up"
                : m.key === "p" || m.key === "m"
                  ? delta > 0
                    ? "up"
                    : "down"
                  : delta > 0
                    ? "down"
                    : "up";
          const cls =
            tone === "up"
              ? "text-[color:var(--success)] border-[color:var(--success)]/40"
              : tone === "down"
                ? "text-destructive border-destructive/40"
                : "text-muted-foreground border-border";
          const Icon = tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : Minus;
          return (
            <div
              key={m.key}
              className={`flex flex-col items-center rounded border ${cls} bg-panel-elevated/40 px-1 py-1`}
            >
              <span className="font-mono text-[9px] text-muted-foreground">{m.label}</span>
              <span className="mt-0.5 font-mono text-[10px]">{fmt(m.after, m.kind)}</span>
              <span className="mt-0.5 flex items-center gap-0.5 font-mono text-[9px]">
                <Icon className="h-2.5 w-2.5" />
                {tone === "flat" ? "≈" : (delta > 0 ? "+" : "") + fmt(Math.abs(delta), m.kind)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

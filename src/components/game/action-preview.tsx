import { useMemo } from "react";
import { produce } from "immer";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { BAL } from "@/game/balance";
import { DECISIONS } from "@/game/decisions";
import { computeQuarter } from "@/game/engine/laws";
import type { DecisionOptionId, GameState } from "@/game/types";

type Metric = {
  key: string;
  label: string;
  before: number;
  after: number;
  kind: "money" | "pct" | "num";
  direction: "higher-good" | "lower-good" | "neutral";
};

function fmt(value: number, kind: Metric["kind"]) {
  if (kind === "pct") return `${(value * 100).toFixed(1)}%`;
  if (kind === "money") return `$${Math.round(value).toLocaleString("vi-VN")}`;
  return value.toFixed(1);
}

function accumulationMetrics(state: GameState, next: GameState): Metric[] {
  const before = computeQuarter(state);
  const after = computeQuarter(next);
  const cashBefore = state.cash + before.operatingCashFlow - before.ownerConsumption;
  const cashAfter = next.cash + after.operatingCashFlow - after.ownerConsumption;
  const fundBefore = state.accumulationFund + before.retainedProfit;
  const fundAfter = next.accumulationFund + after.retainedProfit;
  return [
    {
      key: "retained",
      label: "Giữ lại",
      before: before.retainedProfit,
      after: after.retainedProfit,
      kind: "money",
      direction: "neutral",
    },
    {
      key: "owner",
      label: "Chủ tiêu dùng",
      before: before.ownerConsumption,
      after: after.ownerConsumption,
      kind: "money",
      direction: "neutral",
    },
    {
      key: "cash",
      label: "Cash cuối quý",
      before: cashBefore,
      after: cashAfter,
      kind: "money",
      direction: "higher-good",
    },
    {
      key: "fund",
      label: "Quỹ tích lũy",
      before: fundBefore,
      after: fundAfter,
      kind: "money",
      direction: "higher-good",
    },
    {
      key: "gap",
      label: "Thiếu mua máy",
      before: Math.max(0, BAL.machinePrice - fundBefore),
      after: Math.max(0, BAL.machinePrice - fundAfter),
      kind: "money",
      direction: "lower-good",
    },
  ];
}

function creditMetrics(state: GameState, next: GameState): Metric[] {
  const before = computeQuarter(state);
  const after = computeQuarter(next);
  return [
    {
      key: "cash",
      label: "Tiền mặt",
      before: state.cash,
      after: next.cash,
      kind: "money",
      direction: "higher-good",
    },
    {
      key: "debt",
      label: "Dư nợ",
      before: state.debt,
      after: next.debt,
      kind: "money",
      direction: "lower-good",
    },
    {
      key: "interest",
      label: "Lãi quý tới",
      before: before.interestPaid,
      after: after.interestPaid,
      kind: "money",
      direction: "lower-good",
    },
    {
      key: "debt-ratio",
      label: "Nợ/tài sản",
      before: before.debtRatio,
      after: after.debtRatio,
      kind: "pct",
      direction: "lower-good",
    },
  ];
}

function productionMetrics(state: GameState, next: GameState): Metric[] {
  const before = computeQuarter(state);
  const after = computeQuarter(next);
  return [
    {
      key: "output",
      label: "Sản lượng",
      before: before.output,
      after: after.output,
      kind: "num",
      direction: "higher-good",
    },
    {
      key: "v",
      label: "Quỹ lương",
      before: before.v,
      after: after.v,
      kind: "money",
      direction: "neutral",
    },
    {
      key: "m",
      label: "Dôi ra",
      before: before.m,
      after: after.m,
      kind: "money",
      direction: "neutral",
    },
    {
      key: "m-rate",
      label: "m′",
      before: before.exploitation,
      after: after.exploitation,
      kind: "pct",
      direction: "neutral",
    },
    {
      key: "p-real",
      label: "p′ thực",
      before: before.profitRateReal,
      after: after.profitRateReal,
      kind: "pct",
      direction: "higher-good",
    },
    {
      key: "health",
      label: "Sức khỏe",
      before: state.health,
      after: next.health,
      kind: "num",
      direction: "higher-good",
    },
    {
      key: "unrest",
      label: "Bất ổn",
      before: state.unrest,
      after: next.unrest,
      kind: "num",
      direction: "lower-good",
    },
  ];
}

export function ActionPreview({
  state,
  actionId,
}: {
  state: GameState;
  actionId: DecisionOptionId;
}) {
  const metrics = useMemo(() => {
    const next = produce(state, (draft) => DECISIONS[actionId].apply(draft));
    const group = DECISIONS[actionId].groupId;
    if (group === "ACCUMULATION") return accumulationMetrics(state, next);
    if (group === "CREDIT") return creditMetrics(state, next);
    return productionMetrics(state, next);
  }, [state, actionId]);

  return (
    <div className="rounded-md border border-primary/30 bg-[oklch(0.15_0.008_60)] p-2 text-[10px]">
      <div className="mb-1.5 font-semibold uppercase tracking-widest text-muted-foreground">
        Nếu áp dụng quyết định này
      </div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4">
        {metrics.map((metric) => {
          const delta = metric.after - metric.before;
          const epsilon = metric.kind === "pct" ? 0.0005 : metric.kind === "money" ? 1 : 0.05;
          const flat = Math.abs(delta) < epsilon;
          const beneficial =
            !flat &&
            metric.direction !== "neutral" &&
            ((metric.direction === "higher-good" && delta > 0) ||
              (metric.direction === "lower-good" && delta < 0));
          const harmful = !flat && metric.direction !== "neutral" && !beneficial;
          const className = beneficial
            ? "border-[color:var(--success)]/40 text-[color:var(--success)]"
            : harmful
              ? "border-destructive/40 text-destructive"
              : "border-border text-muted-foreground";
          const Icon = flat ? Minus : delta > 0 ? TrendingUp : TrendingDown;
          return (
            <div
              key={metric.key}
              className={`flex min-w-0 flex-col items-center rounded border bg-panel-elevated/40 px-1 py-1 ${className}`}
            >
              <span className="max-w-full truncate font-mono text-[9px] text-muted-foreground">
                {metric.label}
              </span>
              <span className="mt-0.5 font-mono text-[10px]">{fmt(metric.after, metric.kind)}</span>
              <span className="mt-0.5 flex items-center gap-0.5 font-mono text-[9px]">
                <Icon className="h-2.5 w-2.5" />
                {flat ? "≈" : `${delta > 0 ? "+" : "−"}${fmt(Math.abs(delta), metric.kind)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

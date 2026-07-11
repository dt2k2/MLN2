import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, ReferenceDot } from "recharts";

function phaseFor(turn: number) {
  if (turn <= 6) return "Khởi nghiệp";
  if (turn <= 12) return "Tối ưu hóa";
  if (turn <= 18) return "Khủng hoảng";
  return "Đỉnh cao";
}

interface Row {
  q: string;
  v: number;
  i: number;
  turn: number;
}

export function ProfitChart({
  data,
  currentTurn,
  unlocked,
}: {
  data: { q: string; v: number; i: number }[];
  currentTurn: number;
  unlocked: boolean;
}) {
  const rows: Row[] = data.map((d, i) => ({
    ...d,
    turn: currentTurn - (data.length - 1 - i),
  }));
  const last = rows[rows.length - 1];

  return (
    <div className="panel-industrial rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {unlocked ? "Xu hướng tỷ suất lợi nhuận p′" : "Xu hướng hiệu suất tổng vốn"}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground/70">
          {last ? phaseFor(last.turn) : "—"}
        </div>
      </div>
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={rows} margin={{ top: 6, right: 6, bottom: 12, left: 0 }}>
            <defs>
              <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.85} />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="turn"
              stroke="oklch(0.55 0.02 70)"
              tick={{ fontSize: 9, fill: "oklch(0.6 0.02 70)" }}
              tickFormatter={(t) => `Q${t}`}
              interval="preserveStartEnd"
            />
            <Tooltip
              cursor={{ stroke: "var(--gold)", strokeDasharray: 3 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as Row;
                return (
                  <div className="rounded border border-primary/50 bg-[oklch(0.16_0.008_60)] px-2 py-1.5 font-mono text-[10px] shadow-lg">
                    <div className="text-muted-foreground">
                      Quý {p.turn} · <span className="text-gold">{phaseFor(p.turn)}</span>
                    </div>
                    <div className="mt-0.5 text-gold">
                      {unlocked ? "p′" : "Hiệu suất"} = {p.v.toFixed(1)}%
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--gold)"
              strokeWidth={2}
              fill="url(#pg)"
              isAnimationActive
              animationDuration={800}
            />
            {last ? (
              <ReferenceDot
                x={last.turn}
                y={last.v}
                r={5}
                fill="var(--gold)"
                stroke="oklch(0.15 0.01 60)"
                strokeWidth={2}
                isFront
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

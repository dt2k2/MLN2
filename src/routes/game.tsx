import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip as ReTooltip, Cell,
} from "recharts";
import {
  Clock, DollarSign, Cog, Warehouse, UserMinus, Landmark,
  Heart, Users, Package, TrendingUp, Activity, Zap, Info,
  BookOpen, AlertTriangle, ChevronRight, Flag,
} from "lucide-react";
import { GameHeader } from "@/components/game/game-header";
import { DashboardCard } from "@/components/game/dashboard-card";
import { ActionButton } from "@/components/game/action-button";
import { FactoryScene } from "@/components/game/factory-scene";
import {
  EventModal, ConceptModal, TurnSummaryModal,
} from "@/components/game/modals";
import { StatTooltip } from "@/components/game/stat-tooltip";
import { ContradictionCard } from "@/components/game/contradiction-card";
import { ProfitChart } from "@/components/game/profit-chart";
import { CodexPanel } from "@/components/game/codex-panel";
import { EndTurnButton } from "@/components/game/end-turn-button";
import { ActionPreview } from "@/components/game/action-preview";
import { showAchievement } from "@/components/game/achievement-toast";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useGameStore } from "@/game/state";
import { ACTIONS } from "@/game/actions";
import { CONCEPT_INFO, checkEureka, type ConceptKey } from "@/game/concepts";
import type { ActionId, GameState } from "@/game/types";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Ván chơi — Das Kapitalist" },
      {
        name: "description",
        content:
          "Bảng điều khiển xí nghiệp: c, v, m, tỷ suất lợi nhuận và các quyết định của nhà tư bản.",
      },
    ],
  }),
  component: GameScreen,
});

const ACTION_ICONS: Record<ActionId, typeof Clock> = {
  EXTEND_HOURS: Clock,
  RAISE_WAGE: DollarSign,
  BUY_MACHINE: Cog,
  EXPAND_FACTORY: Warehouse,
  LAYOFF: UserMinus,
  BORROW: Landmark,
};

function GameScreen() {
  const state = useGameStore((s) => s.state);
  const usedActions = useGameStore((s) => s.usedActions);
  const applyAction = useGameStore((s) => s.applyAction);
  const endQuarter = useGameStore((s) => s.endQuarter);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const [concept, setConcept] = useState(false);
  const [summary, setSummary] = useState(false);
  const [codex, setCodex] = useState<ConceptKey | null>(null);
  const [discovered, setDiscovered] = useState<Record<ConceptKey, { quarter: number; year: number }>>(
    {} as Record<ConceptKey, { quarter: number; year: number }>,
  );
  const navigate = useNavigate();
  const prevState = useRef<GameState>(state);

  // Auto navigate on ending
  useEffect(() => {
    if (state.ending === "revolution") navigate({ to: "/ending/revolution" });
    else if (state.ending === "bankruptcy") navigate({ to: "/ending/bankruptcy" });
    else if (state.ending) navigate({ to: "/ending/bankruptcy" });
  }, [state.ending, navigate]);

  // Eureka detector — chạy sau khi state thay đổi (post endQuarter)
  useEffect(() => {
    if (prevState.current.turn !== state.turn) {
      const k = checkEureka(prevState.current, state);
      if (k) {
        setDiscovered((d) =>
          d[k] ? d : { ...d, [k]: { quarter: state.quarter, year: state.year } },
        );
        const info = CONCEPT_INFO[k];
        showAchievement({
          title:
            k === "m"
              ? "🏆 Nhà tư bản máu lạnh — m′ vượt 200%!"
              : k === "pRate"
                ? "📉 Cấu tạo hữu cơ tăng — p′ bắt đầu giảm"
                : k === "contradiction"
                  ? "⚠️ Ngòi nổ đã châm — Mâu thuẫn xuyên 50"
                  : `Khai mở khái niệm — ${info.title}`,
          description: info.short + " · " + info.formula,
          conceptName: info.title,
        });
        setConcept(true);
      }
    }
    prevState.current = state;
  }, [state]);

  const last = state.last;
  const prevProfitRate = useRef(last.profitRate);
  useEffect(() => {
    prevProfitRate.current = last.profitRate;
  }, [last.profitRate]);

  const profitTrend = useMemo(
    () =>
      state.history.slice(-12).map((r, i) => ({
        q: `Q${r.quarter}`,
        v: +(r.profitRate * 100).toFixed(1),
        i,
      })),
    [state.history],
  );

  const cvmTotal = Math.max(1, last.c + last.v + last.m);
  const capitalRatio = [
    { name: "c", v: Math.round((last.c / cvmTotal) * 100), color: "var(--color-info)" },
    { name: "v", v: Math.round((last.v / cvmTotal) * 100), color: "var(--gold)" },
    { name: "m", v: Math.round((last.m / cvmTotal) * 100), color: "var(--success)" },
  ];

  const contradictionInt = Math.round(state.contradiction);
  const quarterLabel = `Quý ${roman(state.quarter)} · ${state.year}`;

  const conceptChips: { key: ConceptKey; label: string }[] = [
    { key: "c", label: "Tư bản bất biến (c)" },
    { key: "v", label: "Tư bản khả biến (v)" },
    { key: "m", label: "Giá trị thặng dư (m)" },
    { key: "pRate", label: "Tỷ suất lợi nhuận (p′)" },
    { key: "contradiction", label: "Mâu thuẫn (K)" },
  ];

  return (
    <div className="min-h-screen p-3">
      <div className="flex flex-col gap-3">
        <GameHeader
          turn={state.turn}
          quarter={quarterLabel}
          company={state.companyName}
          money={Math.round(state.cash)}
          onPause={() => setSummary(true)}
        />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:min-h-[calc(100vh-100px)]">
          {/* LEFT PANEL — Factory (below fold on mobile) */}
          <section className="order-4 flex flex-col gap-3 lg:order-1 lg:col-span-3 lg:min-h-0">
            <FactoryScene />
            <div className="panel-industrial rounded-lg p-4">
              <SectionTitle icon={<Users className="h-3.5 w-3.5" />} label="Lực lượng lao động" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniStat label="Công nhân" value={String(state.workersActive)} mono />
                <MiniStat
                  label="Thất nghiệp"
                  value={String(state.workersIdle)}
                  mono
                  tone="danger"
                />
                <StatBar
                  label="Sức khoẻ"
                  value={Math.round(state.health)}
                  tone={state.health > 60 ? "success" : "danger"}
                  icon={<Heart className="h-3 w-3" />}
                />
                <StatBar
                  label="Tinh thần"
                  value={Math.round(100 - state.unrest)}
                  tone="gold"
                  icon={<Activity className="h-3 w-3" />}
                />
              </div>
              <div className="mt-4 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" /> Tồn kho
                  </span>
                  <span className="font-mono text-foreground">
                    {Math.round(state.inventory).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-panel-elevated">
                  <div
                    className="h-full rounded bg-gradient-to-r from-primary to-[color:var(--info)]"
                    style={{
                      width: `${Math.min(100, (state.inventory / Math.max(1, state.demand)) * 50)}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Giờ làm</span>
                  <span className="font-mono text-foreground">{state.workHours}h / ngày</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lương</span>
                  <span className="font-mono text-foreground">
                    ${state.wagePerWorker}/quý
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CENTER PANEL */}
          <section className="order-2 flex flex-col gap-3 lg:col-span-6 lg:min-h-0">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTooltip conceptKey="c">
                <DashboardCard
                  label="Tư bản bất biến"
                  symbol="c"
                  value={Math.round(last.c)}
                  prefix="$"
                  icon={Cog}
                  tone="info"
                  hint="Máy móc + nguyên liệu"
                />
              </StatTooltip>
              <StatTooltip conceptKey="v">
                <DashboardCard
                  label="Tư bản khả biến"
                  symbol="v"
                  value={Math.round(last.v)}
                  prefix="$"
                  icon={Users}
                  tone="gold"
                  hint="Tiền lương công nhân"
                />
              </StatTooltip>
              <StatTooltip conceptKey="m">
                <DashboardCard
                  label="Giá trị thặng dư"
                  symbol="m = V′ − v"
                  value={Math.round(last.m)}
                  prefix="$"
                  icon={TrendingUp}
                  tone="success"
                  hint={`m′ = ${(last.exploitation * 100).toFixed(0)}%`}
                />
              </StatTooltip>
              <StatTooltip conceptKey="pRate">
                <DashboardCard
                  label="Tỷ suất lợi nhuận"
                  symbol="p′ = m/(c+v)"
                  value={+(last.profitRate * 100).toFixed(1)}
                  suffix="%"
                  decimals={1}
                  icon={Zap}
                  tone="gold"
                  hint={`c/v = ${last.organic.toFixed(2)}`}
                  flashOnDrop
                />
              </StatTooltip>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ProfitChart data={profitTrend} currentTurn={state.turn} />

              <ChartCard title="Cơ cấu tư bản" hint="c : v : m">
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart
                    data={capitalRatio}
                    layout="vertical"
                    margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                  >
                    <ReTooltip
                      contentStyle={{
                        background: "oklch(0.18 0.006 60)",
                        border: "1px solid oklch(0.32 0.008 60)",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="v" radius={4}>
                      {capitalRatio.map((c) => (
                        <Cell key={c.name} fill={c.color} />
                      ))}
                    </Bar>
                    <XAxis type="number" hide />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-1 flex justify-around text-[10px] font-mono text-muted-foreground">
                  <span><span className="text-[color:var(--info)]">■</span> c {capitalRatio[0].v}%</span>
                  <span><span className="text-gold">■</span> v {capitalRatio[1].v}%</span>
                  <span><span className="text-[color:var(--success)]">■</span> m {capitalRatio[2].v}%</span>
                </div>
              </ChartCard>

              <ContradictionCard value={contradictionInt} unrest={state.unrest} />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MarketCard
                label="Cầu thị trường"
                value={state.demand.toLocaleString("vi-VN")}
                unit="đvsp"
                tone="info"
              />
              <MarketCard
                label="Sản lượng"
                value={Math.round(last.output).toLocaleString("vi-VN")}
                unit="đvsp"
                tone="gold"
              />
              <MarketCard
                label="Giá bán"
                value={`$${state.sellPrice.toFixed(1)}`}
                unit="/đv"
                tone="success"
              />
              <MarketCard
                label="Thị phần"
                value={`${(state.marketShare * 100).toFixed(0)}%`}
                unit=""
                tone={state.marketShare > 0.4 ? "success" : "danger"}
              />
            </div>

            {/* Bottom log */}
            <div className="panel-industrial flex min-h-[190px] flex-col rounded-lg p-4">
              <div className="flex items-center justify-between gap-2">
                <SectionTitle
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Nhật ký · Codex"
                />
                <div className="flex flex-wrap gap-1">
                  {conceptChips.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCodex(c.key)}
                      className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition hover:border-primary/60 hover:text-gold"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex-1 overflow-y-auto pr-1">
                <ul className="space-y-1.5">
                  {state.log.slice(0, 12).map((l, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded border border-border/40 bg-panel-elevated/40 px-3 py-1.5 text-xs"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        T{l.turn}
                      </span>
                      <LogIcon type={l.type} />
                      <span className="text-foreground">{l.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL — Decisions */}
          <section className="order-3 flex flex-col gap-3 lg:col-span-3 lg:min-h-0">
            <div className="panel-industrial rounded-lg p-4">
              <SectionTitle
                icon={<Info className="h-3.5 w-3.5" />}
                label={`Quyết định — ${quarterLabel}`}
                right={
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {usedActions.size} / 3 đã dùng
                  </span>
                }
              />
            </div>
            <div className="flex flex-col gap-2 lg:overflow-y-auto lg:pr-1 lg:min-h-0 lg:flex-1">
              {(Object.keys(ACTIONS) as ActionId[]).map((id) => {
                const act = ACTIONS[id];
                const cost = act.cost(state);
                const disabled = usedActions.has(id) || !act.canApply(state);
                return (
                  <HoverCard key={id} openDelay={250} closeDelay={80}>
                    <HoverCardTrigger asChild>
                      <div className={disabled ? "pointer-events-none opacity-40" : ""}>
                        <ActionButton
                          icon={ACTION_ICONS[id]}
                          title={act.title}
                          description={act.description}
                          cost={cost > 0 ? `$${cost.toLocaleString("vi-VN")}` : "—"}
                          previews={act.preview(state)}
                          onClick={() => applyAction(id)}
                        />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="left"
                      align="start"
                      className="w-80 border-primary/40 bg-[oklch(0.16_0.008_60)] p-2"
                    >
                      <ActionPreview state={state} actionId={id} />
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </div>
            <EndTurnButton
              onEnd={() => {
                endQuarter();
                setSummary(true);
              }}
            />
          </section>
        </div>

        {/* Codex FAB (mobile only) */}
        <button
          onClick={() => setCodex("m")}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-primary bg-[oklch(0.2_0.02_60)] px-4 py-2 font-mono text-xs text-gold shadow-lg lg:hidden"
        >
          📚 5/15
        </button>

        <div className="fixed bottom-3 right-3 z-40 hidden gap-2 rounded-md border border-border bg-panel/80 p-1.5 font-mono text-[10px] backdrop-blur lg:flex">
          <span className="px-1.5 py-0.5 text-muted-foreground">DEV</span>
          <Link
            to="/ending/revolution"
            className="rounded bg-destructive/20 px-2 py-0.5 text-destructive hover:bg-destructive/30"
          >
            <Flag className="mr-1 inline h-3 w-3" />
            Ending: Cách mạng
          </Link>
          <Link
            to="/ending/bankruptcy"
            className="rounded bg-[color:var(--info)]/15 px-2 py-0.5 text-[color:var(--info)] hover:bg-[color:var(--info)]/25"
          >
            Ending: Phá sản
          </Link>
          <button
            onClick={() =>
              showAchievement({
                title: "🏆 Nhà tư bản máu lạnh — m′ vượt 200%!",
                description: "Bạn đã đạt mức bóc lột lịch sử",
                conceptName: "Giá trị thặng dư",
              })
            }
            className="rounded bg-primary/20 px-2 py-0.5 text-gold hover:bg-primary/30"
          >
            Demo toast
          </button>
        </div>

        <EventModal
          open={!!state.pendingEvent}
          onClose={() => {}}
          title={state.pendingEvent?.title ?? ""}
          description={state.pendingEvent?.description ?? ""}
          quarterLabel={quarterLabel}
          choices={
            state.pendingEvent?.choices.map((c) => ({
              label: c.label,
              tone: c.tone,
              previewLabel: c.previewLabel,
            })) ?? []
          }
          onChoose={(i) => resolveEvent(i)}
        />
        <ConceptModal open={concept} onClose={() => setConcept(false)} />
        <CodexPanel
          open={!!codex}
          conceptKey={codex}
          onClose={() => setCodex(null)}
          discoveredAt={codex ? discovered[codex] : undefined}
        />
        <TurnSummaryModal
          open={summary && !state.pendingEvent}
          onClose={() => setSummary(false)}
          title={`Kết thúc quý — Lượt ${state.turn} / 24`}
          rows={[
            { label: "Doanh thu W", value: `+ $${Math.round(last.W).toLocaleString("vi-VN")}`, tone: "up" },
            { label: "Bất biến c", value: `− $${Math.round(last.c).toLocaleString("vi-VN")}`, tone: "down" },
            { label: "Khả biến v", value: `− $${Math.round(last.v).toLocaleString("vi-VN")}`, tone: "down" },
            {
              label: "Lợi nhuận",
              value: `${last.profit >= 0 ? "+" : "−"} $${Math.abs(Math.round(last.profit)).toLocaleString("vi-VN")}`,
              tone: last.profit >= 0 ? "up" : "down",
            },
            { label: "p′ lý thuyết", value: `${(last.profitRate * 100).toFixed(1)}%`, tone: "warn" },
            { label: "c/v", value: last.organic.toFixed(2), tone: "warn" },
            { label: "Sức khoẻ", value: `${Math.round(state.health)}%`, tone: state.health >= 60 ? "up" : "down" },
            { label: "Mâu thuẫn", value: `${Math.round(state.contradiction)}/100`, tone: "warn" },
          ]}
        />
      </div>
    </div>
  );
}

function roman(n: number) {
  return ["", "I", "II", "III", "IV"][n] ?? String(n);
}

function SectionTitle({
  icon, label, right,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      {right}
    </div>
  );
}

function MiniStat({
  label, value, mono, tone = "default",
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "default" | "danger" | "gold";
}) {
  const c =
    tone === "danger" ? "text-destructive" : tone === "gold" ? "text-gold" : "text-foreground";
  return (
    <div className="rounded border border-border bg-panel-elevated/60 px-2 py-1.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} text-lg ${c}`}>{value}</div>
    </div>
  );
}

function StatBar({
  label, value, tone, icon,
}: {
  label: string;
  value: number;
  tone: "success" | "gold" | "danger";
  icon: React.ReactNode;
}) {
  const color =
    tone === "success"
      ? "bg-[color:var(--success)]"
      : tone === "gold"
        ? "bg-gold"
        : "bg-destructive";
  return (
    <div className="rounded border border-border bg-panel-elevated/60 px-2 py-1.5">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          {icon} {label}
        </span>
        <span className="font-mono text-foreground">{value}%</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded bg-panel">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9 }}
          className={`h-full rounded ${color}`}
        />
      </div>
    </div>
  );
}

function ChartCard({
  title, hint, children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel-industrial rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground/70">{hint}</div>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function MarketCard({
  label, value, unit, tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: "info" | "gold" | "success" | "danger";
}) {
  const c = {
    info: "text-[color:var(--info)]",
    gold: "text-gold",
    success: "text-[color:var(--success)]",
    danger: "text-destructive",
  }[tone];
  return (
    <div className="panel-industrial rounded-lg p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`font-mono text-2xl ${c}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function LogIcon({ type }: { type: string }) {
  if (type === "event")
    return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[color:var(--contradiction)]" />;
  if (type === "concept")
    return <BookOpen className="h-3.5 w-3.5 shrink-0 text-[color:var(--info)]" />;
  if (type === "decision")
    return <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold" />;
  return <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
}

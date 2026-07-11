import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip as ReTooltip, Cell } from "recharts";
import {
  Clock,
  DollarSign,
  Cog,
  Warehouse,
  UserMinus,
  Landmark,
  Heart,
  Users,
  Package,
  TrendingUp,
  Activity,
  Zap,
  Info,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Flag,
} from "lucide-react";
import { GameHeader } from "@/components/game/game-header";
import { DashboardCard } from "@/components/game/dashboard-card";
import { ActionButton } from "@/components/game/action-button";
import { FactoryScene } from "@/components/game/factory-scene";
import {
  EventModal,
  ConceptModal,
  EraRecapModal,
  TurnSummaryModal,
} from "@/components/game/modals";
import { StatTooltip } from "@/components/game/stat-tooltip";
import { ContradictionCard } from "@/components/game/contradiction-card";
import { ProfitChart } from "@/components/game/profit-chart";
import { CodexPanel } from "@/components/game/codex-panel";
import { EndTurnButton } from "@/components/game/end-turn-button";
import { ActionPreview } from "@/components/game/action-preview";
import { showAchievement } from "@/components/game/achievement-toast";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { MAX_ACTIONS_PER_TURN, useGameStore } from "@/game/state";
import { ACTIONS } from "@/game/actions";
import { CONCEPT_INFO, CONCEPT_KEYS } from "@/game/concepts";
import type { ActionId, ConceptKey } from "@/game/types";

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
  const presentationQueue = useGameStore((s) => s.presentationQueue);
  const dismissPresentation = useGameStore((s) => s.dismissPresentation);
  const showCurrentSummary = useGameStore((s) => s.showCurrentSummary);
  const [codexOpen, setCodexOpen] = useState(false);
  const [codex, setCodex] = useState<ConceptKey | null>(null);
  const navigate = useNavigate();
  const activePresentation = presentationQueue[0];

  useEffect(() => {
    if (presentationQueue.length > 0 || state.pendingEvent || !state.ending) return;
    if (state.ending === "revolution") {
      navigate({ to: "/ending/revolution" });
    } else if (state.ending === "bankruptcy") {
      navigate({ to: "/ending/bankruptcy" });
    } else {
      navigate({ to: "/ending/outcome", search: { result: state.ending } });
    }
  }, [state.ending, state.pendingEvent, presentationQueue.length, navigate]);

  useEffect(() => {
    if (activePresentation?.kind !== "achievement") return;
    showAchievement(
      activePresentation.achievementId,
      CONCEPT_INFO[activePresentation.conceptKey].title,
    );
    dismissPresentation();
  }, [activePresentation, dismissPresentation]);

  const last = state.last;
  const eurekaDiscovery =
    activePresentation?.kind === "eureka"
      ? state.discoveredConcepts[activePresentation.conceptKey]
      : undefined;
  const summaryRecord =
    activePresentation?.kind === "summary"
      ? state.history.find((record) => record.turn === activePresentation.completedTurn)
      : undefined;
  const displayRecord = summaryRecord ?? last;

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

  const discoveredCount = Object.keys(state.discoveredConcepts).length;

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden p-3">
      <div className="flex min-w-0 flex-col gap-3">
        <GameHeader
          turn={state.turn}
          quarter={quarterLabel}
          company={state.companyName}
          money={Math.round(state.cash)}
          onPause={showCurrentSummary}
        />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:min-h-[calc(100vh-100px)]">
          {/* LEFT PANEL — Factory (below fold on mobile) */}
          <section className="order-4 flex min-w-0 flex-col gap-3 lg:order-1 lg:col-span-3 lg:min-h-0">
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
                  <span className="font-mono text-foreground">${state.wagePerWorker}/quý</span>
                </div>
              </div>
            </div>
          </section>

          {/* CENTER PANEL */}
          <section className="order-2 flex min-w-0 flex-col gap-3 lg:col-span-6 lg:min-h-0">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTooltip conceptKey="constantCapital">
                <DashboardCard
                  label={
                    state.discoveredConcepts.constantCapital ? "Tư bản bất biến" : "Chi phí tư liệu"
                  }
                  symbol={state.discoveredConcepts.constantCapital ? "c" : "Máy + vật liệu"}
                  value={Math.round(last.c)}
                  prefix="$"
                  icon={Cog}
                  tone="info"
                  hint={
                    state.discoveredConcepts.constantCapital
                      ? "Máy móc + nguyên liệu"
                      : "Chi phí sản xuất"
                  }
                />
              </StatTooltip>
              <StatTooltip conceptKey="variableCapital">
                <DashboardCard
                  label={state.discoveredConcepts.variableCapital ? "Tư bản khả biến" : "Quỹ lương"}
                  symbol={state.discoveredConcepts.variableCapital ? "v" : "Tiền công"}
                  value={Math.round(last.v)}
                  prefix="$"
                  icon={Users}
                  tone="gold"
                  hint="Tiền lương công nhân"
                />
              </StatTooltip>
              <StatTooltip conceptKey="surplusValue">
                <DashboardCard
                  label={
                    state.discoveredConcepts.surplusValue ? "Giá trị thặng dư" : "Giá trị dôi ra"
                  }
                  symbol={
                    state.discoveredConcepts.surplusValue ? "m = giá trị mới − v" : "Sau tiền lương"
                  }
                  value={Math.round(last.m)}
                  prefix="$"
                  icon={TrendingUp}
                  tone="success"
                  hint={
                    state.discoveredConcepts.surplusRate
                      ? `m′ = ${(last.exploitation * 100).toFixed(0)}%`
                      : "So với quỹ lương"
                  }
                />
              </StatTooltip>
              <StatTooltip conceptKey="profitRate">
                <DashboardCard
                  label={
                    state.discoveredConcepts.profitRate ? "Tỷ suất lợi nhuận" : "Hiệu suất tổng vốn"
                  }
                  symbol={state.discoveredConcepts.profitRate ? "p′ = m/(c+v)" : "Theo quý"}
                  value={+(last.profitRate * 100).toFixed(1)}
                  suffix="%"
                  decimals={1}
                  icon={Zap}
                  tone="gold"
                  hint={
                    state.discoveredConcepts.organicComposition
                      ? `c/v = ${last.organic.toFixed(2)}`
                      : "Cơ cấu chi phí"
                  }
                  flashOnDrop
                />
              </StatTooltip>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ProfitChart
                data={profitTrend}
                currentTurn={state.turn}
                unlocked={!!state.discoveredConcepts.profitRate}
              />

              <ChartCard
                title={
                  state.discoveredConcepts.organicComposition ? "Cơ cấu tư bản" : "Cơ cấu chi phí"
                }
                hint={
                  state.discoveredConcepts.surplusValue ? "c : v : m" : "tư liệu : lương : dôi ra"
                }
              >
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
                  <span>
                    <span className="text-[color:var(--info)]">■</span>{" "}
                    {state.discoveredConcepts.constantCapital ? "c" : "Tư liệu"} {capitalRatio[0].v}
                    %
                  </span>
                  <span>
                    <span className="text-gold">■</span>{" "}
                    {state.discoveredConcepts.variableCapital ? "v" : "Lương"} {capitalRatio[1].v}%
                  </span>
                  <span>
                    <span className="text-[color:var(--success)]">■</span>{" "}
                    {state.discoveredConcepts.surplusValue ? "m" : "Dôi ra"} {capitalRatio[2].v}%
                  </span>
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
                <SectionTitle icon={<Clock className="h-3.5 w-3.5" />} label="Nhật ký · Codex" />
                <div className="flex flex-wrap gap-1">
                  {CONCEPT_KEYS.map((key) => {
                    const unlocked = !!state.discoveredConcepts[key];
                    return (
                      <button
                        key={key}
                        disabled={!unlocked}
                        onClick={() => {
                          setCodex(key);
                          setCodexOpen(true);
                        }}
                        className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition enabled:hover:border-primary/60 enabled:hover:text-gold disabled:opacity-35"
                      >
                        {unlocked ? CONCEPT_INFO[key].short : "?"}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 flex-1 overflow-y-auto pr-1">
                <ul className="space-y-1.5">
                  {state.log.slice(0, 12).map((l, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded border border-border/40 bg-panel-elevated/40 px-3 py-1.5 text-xs"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">T{l.turn}</span>
                      <LogIcon type={l.type} />
                      <span className="text-foreground">{l.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL — Decisions */}
          <section className="order-3 flex min-w-0 flex-col gap-3 lg:col-span-3 lg:min-h-0">
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
                const disabled =
                  usedActions.has(id) ||
                  usedActions.size >= MAX_ACTIONS_PER_TURN ||
                  presentationQueue.length > 0 ||
                  !!state.pendingEvent ||
                  !!state.ending ||
                  !act.canApply(state);
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
            <EndTurnButton onEnd={endQuarter} />
          </section>
        </div>

        {/* Codex FAB (mobile only) */}
        <button
          onClick={() => {
            setCodexOpen(true);
            const first = CONCEPT_KEYS.find((key) => state.discoveredConcepts[key]);
            setCodex(first ?? null);
          }}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-primary bg-[oklch(0.2_0.02_60)] px-4 py-2 font-mono text-xs text-gold shadow-lg lg:hidden"
        >
          <BookOpen className="h-3.5 w-3.5" /> {discoveredCount}/15
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
        </div>

        <EventModal
          open={presentationQueue.length === 0 && !!state.pendingEvent}
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
        <ConceptModal
          open={activePresentation?.kind === "eureka"}
          onClose={dismissPresentation}
          discovery={eurekaDiscovery}
        />
        <CodexPanel
          open={codexOpen}
          conceptKey={codex}
          onSelect={setCodex}
          onClose={() => setCodexOpen(false)}
        />
        <TurnSummaryModal
          open={activePresentation?.kind === "summary"}
          onClose={dismissPresentation}
          title={`Kết thúc quý — Lượt ${summaryRecord?.turn ?? state.turn} / 24`}
          rows={[
            {
              label: "Doanh thu W",
              value: `+ $${Math.round(displayRecord.W).toLocaleString("vi-VN")}`,
              tone: "up",
            },
            {
              label: state.discoveredConcepts.constantCapital ? "Bất biến c" : "Chi phí tư liệu",
              value: `− $${Math.round(displayRecord.c).toLocaleString("vi-VN")}`,
              tone: "down",
            },
            {
              label: state.discoveredConcepts.variableCapital ? "Khả biến v" : "Quỹ lương",
              value: `− $${Math.round(displayRecord.v).toLocaleString("vi-VN")}`,
              tone: "down",
            },
            {
              label: "Lợi nhuận",
              value: `${displayRecord.profit >= 0 ? "+" : "−"} $${Math.abs(Math.round(displayRecord.profit)).toLocaleString("vi-VN")}`,
              tone: displayRecord.profit >= 0 ? "up" : "down",
            },
            {
              label: state.discoveredConcepts.profitRate ? "p′ lý thuyết" : "Hiệu suất vốn",
              value: `${(displayRecord.profitRate * 100).toFixed(1)}%`,
              tone: "warn",
            },
            {
              label: state.discoveredConcepts.organicComposition ? "c/v" : "Tỷ trọng tư liệu/lương",
              value: displayRecord.organic.toFixed(2),
              tone: "warn",
            },
            {
              label: "Sức khoẻ",
              value: `${Math.round(state.health)}%`,
              tone: state.health >= 60 ? "up" : "down",
            },
            {
              label: state.discoveredConcepts.capitalistContradiction
                ? "Mâu thuẫn"
                : "Áp lực xã hội",
              value: `${Math.round(state.contradiction)}/100`,
              tone: "warn",
            },
          ]}
        />
        <EraRecapModal
          open={activePresentation?.kind === "eraRecap"}
          onClose={dismissPresentation}
          startTurn={activePresentation?.kind === "eraRecap" ? activePresentation.startTurn : 1}
          endTurn={activePresentation?.kind === "eraRecap" ? activePresentation.endTurn : 6}
          conceptKeys={
            activePresentation?.kind === "eraRecap" ? activePresentation.conceptKeys : []
          }
        />
      </div>
    </div>
  );
}

function roman(n: number) {
  return ["", "I", "II", "III", "IV"][n] ?? String(n);
}

function SectionTitle({
  icon,
  label,
  right,
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
  label,
  value,
  mono,
  tone = "default",
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
  label,
  value,
  tone,
  icon,
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
  title,
  hint,
  children,
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
  label,
  value,
  unit,
  tone,
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
  if (type === "decision") return <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold" />;
  return <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
}

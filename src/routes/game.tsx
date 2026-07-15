import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
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
// FactoryScene replaced by HistoricalScale hero
import {
  EventModal,
  ConceptModal,
  EraRecapModal,
  TurnSummaryModal,
  StoryModal,
} from "@/components/game/modals";
import { StatTooltip } from "@/components/game/stat-tooltip";
import { HistoricalScale } from "@/components/game/historical-scale";
import { HeinrichPortrait } from "@/components/game/heinrich-portrait";
import { ContradictionCard } from "@/components/game/contradiction-card";
import { ProfitChart } from "@/components/game/profit-chart";
import { CodexPanel } from "@/components/game/codex-panel";
import { EndTurnButton } from "@/components/game/end-turn-button";
import { ActionPreview } from "@/components/game/action-preview";
import { showAchievement } from "@/components/game/achievement-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MAX_DECISION_GROUPS_PER_TURN, useGameStore } from "@/game/state";
import { DECISION_GROUPS, DECISIONS } from "@/game/decisions";
import { BAL } from "@/game/balance";
import { saveEndingReportSnapshot } from "@/game/ending-report";
import { effectMultiplier } from "@/game/engine/effects";
import { CONCEPT_INFO, CONCEPT_KEYS } from "@/game/concepts";
import type { ConceptKey, DecisionGroupId } from "@/game/types";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { TutorialObserver } from "@/tutorial/observer";
import { useTutorialStore } from "@/tutorial/state";

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

const GROUP_ICONS: Record<DecisionGroupId, typeof Clock> = {
  WORKDAY: Clock,
  WAGES: DollarSign,
  STAFFING: UserMinus,
  MACHINERY: Cog,
  ACCUMULATION: Warehouse,
  CREDIT: Landmark,
};

function GameScreen() {
  const state = useGameStore((s) => s.state);
  const usedDecisionGroups = useGameStore((s) => s.usedDecisionGroups);
  const applyDecision = useGameStore((s) => s.applyDecision);
  const endQuarter = useGameStore((s) => s.endQuarter);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const presentationQueue = useGameStore((s) => s.presentationQueue);
  const dismissPresentation = useGameStore((s) => s.dismissPresentation);
  const showCurrentSummary = useGameStore((s) => s.showCurrentSummary);
  const [codexOpen, setCodexOpen] = useState(false);
  const [codex, setCodex] = useState<ConceptKey | null>(null);
  const [activeGroup, setActiveGroup] = useState<DecisionGroupId>("WORKDAY");
  const navigate = useNavigate();
  const activePresentation = presentationQueue[0];
  const tutorialStart = useTutorialStore((s) => s.start);
  const tutorialCompleted = useTutorialStore((s) => s.completed);
  const tutorialSkipped = useTutorialStore((s) => s.skipped);
  const tutorialActive = useTutorialStore((s) => s.active);
  const prevQueueLenRef = useRef(presentationQueue.length);
  useEffect(() => {
    const prev = prevQueueLenRef.current;
    prevQueueLenRef.current = presentationQueue.length;
    if (
      state.turn === 1 &&
      prev > 0 &&
      presentationQueue.length === 0 &&
      !tutorialActive &&
      !tutorialCompleted &&
      !tutorialSkipped
    ) {
      tutorialStart();
    }
  }, [presentationQueue.length, state.turn, tutorialActive, tutorialCompleted, tutorialSkipped, tutorialStart]);

  useEffect(() => {
    if (presentationQueue.length > 0 || state.pendingEvent || !state.ending) return;
    saveEndingReportSnapshot(state, state.ending);
    if (state.ending === "revolution") {
      navigate({ to: "/ending/revolution" });
    } else if (state.ending === "bankruptcy") {
      navigate({ to: "/ending/bankruptcy" });
    } else {
      navigate({ to: "/ending/outcome", search: { result: state.ending } });
    }
  }, [state, presentationQueue.length, navigate]);

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

  const cvmTotal = Math.max(1, last.commodityValue);
  const capitalRatio = [
    {
      name: "c",
      v: Math.round((last.cTransferred / cvmTotal) * 100),
      color: "var(--color-info)",
    },
    {
      name: "v",
      v: Math.round((last.reproducedVariableCapital / cvmTotal) * 100),
      color: "var(--gold)",
    },
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
          accumulationFund={state.accumulationFund}
          debt={state.debt}
          nextInterest={
            state.debt * BAL.quarterlyLoanRate * effectMultiplier(state, "interestRateMultiplier")
          }
          debtRatio={
            state.debt /
            Math.max(
              1,
              Math.max(0, state.cash) +
                state.machineBookValue +
                state.inventory * BAL.unitMaterial * state.materialPrice,
            )
          }
          onPause={showCurrentSummary}
        />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:min-h-[calc(100vh-100px)]">
          {/* LEFT PANEL — Factory (below fold on mobile) */}
          <section className="order-4 flex min-w-0 flex-col gap-3 lg:order-1 lg:col-span-3 lg:min-h-0">
            <HeinrichPortrait state={state} />
            <HistoricalScale state={state} variant="card" fill />
            <div className="panel-industrial flex shrink-0 flex-col rounded-lg p-4">
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
            <div data-tutorial="dashboard-grid" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatTooltip conceptKey="constantCapital">
                <DashboardCard
                  label={
                    state.discoveredConcepts.constantCapital ? "Tư bản bất biến" : "Chi phí tư liệu"
                  }
                  symbol={state.discoveredConcepts.constantCapital ? "c" : undefined}
                  value={Math.round(last.cTransferred)}
                  prefix="$"
                  icon={Cog}
                  tone="info"
                  hint="Nguyên liệu + khấu hao"
                />
              </StatTooltip>
              <StatTooltip conceptKey="variableCapital">
                <DashboardCard
                  label={state.discoveredConcepts.variableCapital ? "Tư bản khả biến" : "Quỹ lương"}
                  symbol={state.discoveredConcepts.variableCapital ? "v" : undefined}
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
                  symbol={state.discoveredConcepts.surplusValue ? "m" : undefined}
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
                    state.discoveredConcepts.profitRate
                      ? "Tỷ suất lợi nhuận quý"
                      : "Hiệu suất vốn quý"
                  }
                  symbol={state.discoveredConcepts.profitRate ? "p′" : undefined}
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

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
              <div data-tutorial="profit-chart">
                <ProfitChart
                  data={profitTrend}
                  currentTurn={state.turn}
                  unlocked={!!state.discoveredConcepts.profitRate}
                  hasData={state.history.length > 0}
                />
              </div>

              <div data-tutorial="cvm-chart">
                <ChartCard
                  title={
                    state.discoveredConcepts.surplusValue ? "Cấu thành giá trị" : "Giá trị sản phẩm"
                  }
                  hint={
                    state.discoveredConcepts.surplusValue
                      ? "c chuyển dịch : v tái tạo : m"
                      : "tư liệu : lương tái tạo : dôi ra"
                  }
                >
                  {state.history.length === 0 || last.commodityValue <= 0 ? (
                    <div className="flex h-[110px] items-center justify-center text-center text-xs text-muted-foreground">
                      Chưa có dữ liệu quý
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={90}>
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
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-foreground/80">
                        <span className="whitespace-nowrap">
                          <span className="text-[color:var(--info)]">■</span> c {capitalRatio[0].v}%
                        </span>
                        <span className="whitespace-nowrap">
                          <span className="text-gold">■</span> v {capitalRatio[1].v}%
                        </span>
                        <span className="whitespace-nowrap">
                          <span className="text-[color:var(--success)]">■</span> m{" "}
                          {capitalRatio[2].v}%
                        </span>
                      </div>
                      {last.unrecoveredVariableCapital > 0 && (
                        <p className="mt-1 text-[10px] text-destructive">
                          Quỹ lương chưa tái tạo: $
                          {Math.round(last.unrecoveredVariableCapital).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </>
                  )}
                </ChartCard>
              </div>

              <div data-tutorial="contradiction">
                <ContradictionCard value={contradictionInt} unrest={state.unrest} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <MarketCard
                label="Cầu dành cho xưởng"
                value={state.demand.toLocaleString("vi-VN")}
                unit="đvsp"
                tone="info"
                tutorialId="market-firm-demand"
              />
              <MarketCard
                label="Cầu hiệu dụng ngành"
                value={state.effectiveDemand.toLocaleString("vi-VN")}
                unit="đvsp"
                tone="info"
                tutorialId="market-demand-industry"
              />
              <MarketCard
                label="Tổng cung ngành"
                value={Math.round(state.industrySupply).toLocaleString("vi-VN")}
                unit="đvsp"
                tone={state.industrySupply > state.effectiveDemand ? "danger" : "success"}
                tutorialId="market-supply-industry"
              />
              <MarketCard
                label="Sản lượng"
                value={Math.round(last.output).toLocaleString("vi-VN")}
                unit="đvsp"
                tone="gold"
                tutorialId="market-output"
              />
              <MarketCard
                label="Giá bán"
                value={`$${state.sellPrice.toFixed(1)}`}
                unit="/đv"
                tone="success"
                tutorialId="market-price"
              />
              <MarketCard
                label="Thị phần"
                value={`${(state.marketShare * 100).toFixed(0)}%`}
                unit=""
                tone={state.marketShare > 0.4 ? "success" : "danger"}
                tutorialId="market-share"
              />
            </div>


            {/* Bottom log */}
            <div data-tutorial="log-panel" className="panel-industrial flex min-h-[190px] flex-1 flex-col rounded-lg p-4">
              <SectionTitle icon={<Clock className="h-3.5 w-3.5" />} label="Nhật ký · Codex" />
              <div className="mt-2 -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
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
                      title={unlocked ? CONCEPT_INFO[key].title : "Chưa khám phá"}
                      className="shrink-0 cursor-pointer rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition enabled:hover:border-primary/60 enabled:hover:text-gold disabled:cursor-help disabled:opacity-35"
                    >
                      {unlocked ? CONCEPT_INFO[key].short : "?"}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex-1 overflow-y-auto border-t border-border/40 pt-2 pr-1">
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
            <div data-tutorial="decision-panel" className="panel-industrial flex min-h-0 flex-1 flex-col rounded-lg p-3">
              <SectionTitle
                icon={<Info className="h-3.5 w-3.5" />}
                label={`Quyết định — ${quarterLabel}`}
                right={
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {usedDecisionGroups.size} / {MAX_DECISION_GROUPS_PER_TURN} nhóm
                  </span>
                }
              />
              <Tabs
                value={activeGroup}
                onValueChange={(v) => setActiveGroup(v as DecisionGroupId)}
                className="mt-3 flex min-h-0 flex-1 flex-col"
              >
                <TabsList data-tutorial="decision-tabs" className="grid h-auto w-full grid-cols-6 gap-1 bg-panel-elevated/40 p-1">
                  {DECISION_GROUPS.map((group) => {
                    const Icon = GROUP_ICONS[group.id];
                    const used = usedDecisionGroups.has(group.id);
                    return (
                      <TabsTrigger
                        key={group.id}
                        value={group.id}
                        title={group.title}
                        className="relative h-10 cursor-pointer px-0 data-[state=active]:bg-primary/15 data-[state=active]:text-gold"
                      >
                        <Icon className="h-4 w-4" />
                        {used ? (
                          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gold" />
                        ) : null}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {DECISION_GROUPS.map((group) => {
                  const groupUsed = usedDecisionGroups.has(group.id);
                  const capReached =
                    usedDecisionGroups.size >= MAX_DECISION_GROUPS_PER_TURN && !groupUsed;
                  const groupLocked =
                    groupUsed ||
                    capReached ||
                    presentationQueue.length > 0 ||
                    !!state.pendingEvent ||
                    !!state.ending;
                  return (
                    <TabsContent
                      key={group.id}
                      value={group.id}
                      className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-semibold text-foreground">
                          {group.title}
                        </span>
                        {groupUsed ? (
                          <span className="font-mono text-[10px] text-gold">Đã dùng quý này</span>
                        ) : capReached ? (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            Đã đạt trần
                          </span>
                        ) : null}
                      </div>
                      {group.options.map((optionId) => {
                        const option = DECISIONS[optionId];
                        const disabled = groupLocked || !option.canApply(state);
                        const reason = !option.canApply(state) ? option.disabledReason(state) : "";
                        return (
                          <div
                            key={optionId}
                            className="rounded border border-border bg-panel-elevated/60 p-2"
                          >
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => applyDecision(optionId)}
                              className="w-full cursor-pointer rounded bg-panel px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:border-primary/60 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {option.label}
                            </button>
                            <p className="mt-1.5 px-1 text-[11px] leading-snug text-muted-foreground">
                              {reason || option.description}
                            </p>
                            {!disabled ? (
                              <div className="mt-2">
                                <ActionPreview state={state} actionId={optionId} />
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
            <div data-tutorial="end-quarter">
              <EndTurnButton onEnd={endQuarter} />
            </div>
          </section>
        </div>

        {/* Codex FAB (mobile only) */}
        <button
          onClick={() => {
            setCodexOpen(true);
            const first = CONCEPT_KEYS.find((key) => state.discoveredConcepts[key]);
            setCodex(first ?? null);
          }}
          className="fixed bottom-4 left-4 z-40 flex cursor-pointer items-center gap-1.5 rounded-full border border-primary bg-[oklch(0.2_0.02_60)] px-4 py-2 font-mono text-xs text-gold shadow-lg lg:hidden"
        >
          <BookOpen className="h-3.5 w-3.5" /> {discoveredCount}/15
        </button>

        <details className="fixed bottom-3 right-3 z-40 hidden rounded-md border border-border bg-panel/80 font-mono text-[10px] backdrop-blur lg:block">
          <summary className="cursor-pointer list-none px-2 py-1 text-muted-foreground hover:text-primary">
            <Flag className="inline h-3 w-3" /> DEV
          </summary>
          <div className="flex flex-col gap-1 p-1.5">
            <Link
              to="/ending/revolution"
              className="rounded bg-destructive/20 px-2 py-0.5 text-destructive hover:bg-destructive/30"
            >
              Cách mạng
            </Link>
            <Link
              to="/ending/bankruptcy"
              className="rounded bg-[color:var(--info)]/15 px-2 py-0.5 text-[color:var(--info)] hover:bg-[color:var(--info)]/25"
            >
              Phá sản
            </Link>
          </div>
        </details>

        <EventModal
          open={activePresentation?.kind === "event" && !!state.pendingEvent}
          onClose={() => {}}
          title={state.pendingEvent?.title ?? ""}
          description={state.pendingEvent?.description ?? ""}
          quarterLabel={quarterLabel}
          choices={
            state.pendingEvent?.choices.map((c) => ({
              label: c.label,
              tone: c.tone,
              previewLabel: c.previewLabel,
              disabled: c.canChoose ? !c.canChoose(state) : false,
              disabledReason: c.disabledReason,
            })) ?? []
          }
          onChoose={(i) => resolveEvent(i)}
        />
        <ConceptModal
          open={activePresentation?.kind === "eureka"}
          onClose={dismissPresentation}
          discovery={eurekaDiscovery}
          series={activePresentation?.kind === "eureka" ? activePresentation.series : undefined}
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
              label: "Doanh thu thực hiện",
              value: `+ $${Math.round(displayRecord.revenue).toLocaleString("vi-VN")}`,
              tone: "up",
            },
            {
              label: "Nguyên liệu đã dùng",
              value: `− $${Math.round(displayRecord.materialCost).toLocaleString("vi-VN")}`,
              tone: "down",
            },
            {
              label: state.discoveredConcepts.variableCapital ? "Khả biến v" : "Quỹ lương",
              value: `− $${Math.round(displayRecord.v).toLocaleString("vi-VN")}`,
              tone: "down",
            },
            {
              label: "Khấu hao chuyển dịch",
              value: `− $${Math.round(displayRecord.depreciation).toLocaleString("vi-VN")}`,
              tone: "warn",
            },
            {
              label: "Lãi tín dụng đã trả",
              value: `− $${Math.round(displayRecord.interestPaid).toLocaleString("vi-VN")}`,
              tone: "down",
            },
            {
              label: "Lợi nhuận kế toán",
              value: `${displayRecord.accountingProfit >= 0 ? "+" : "−"} $${Math.abs(Math.round(displayRecord.accountingProfit)).toLocaleString("vi-VN")}`,
              tone: displayRecord.accountingProfit >= 0 ? "up" : "down",
            },
            {
              label: "Dòng tiền vận hành",
              value: `${displayRecord.operatingCashFlow >= 0 ? "+" : "−"} $${Math.abs(Math.round(displayRecord.operatingCashFlow)).toLocaleString("vi-VN")}`,
              tone: displayRecord.operatingCashFlow >= 0 ? "up" : "down",
            },
            {
              label: "Lợi nhuận giữ lại",
              value: `$${Math.round(displayRecord.retainedProfit).toLocaleString("vi-VN")}`,
              tone: "warn",
            },
            {
              label: "Chủ sở hữu tiêu dùng",
              value: `$${Math.round(displayRecord.ownerConsumption).toLocaleString("vi-VN")}`,
              tone: "warn",
            },
            {
              label: state.discoveredConcepts.profitRate ? "p′ lý thuyết quý" : "Hiệu suất vốn quý",
              value: `${(displayRecord.profitRate * 100).toFixed(1)}%`,
              tone: "warn",
            },
            {
              label: "p′ thực tế quý",
              value: `${(displayRecord.profitRateReal * 100).toFixed(1)}%`,
              tone: displayRecord.profitRateReal >= 0 ? "up" : "down",
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
        <StoryModal
          open={activePresentation?.kind === "story"}
          onClose={dismissPresentation}
          story={activePresentation?.kind === "story" ? activePresentation.story : undefined}
        />
        <TutorialObserver />
        <TutorialOverlay onOpenDecisionGroup={(g) => setActiveGroup(g as DecisionGroupId)} />
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
  tutorialId,
}: {
  label: string;
  value: string;
  unit: string;
  tone: "info" | "gold" | "success" | "danger";
  tutorialId?: string;
}) {
  const c = {
    info: "text-[color:var(--info)]",
    gold: "text-gold",
    success: "text-[color:var(--success)]",
    danger: "text-destructive",
  }[tone];
  return (
    <div data-tutorial={tutorialId} className="panel-industrial rounded-lg p-3">
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

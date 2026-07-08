import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
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
import { MobileWarning } from "@/components/game/mobile-warning";
import {
  EventModal,
  ConceptModal,
  TurnSummaryModal,
} from "@/components/game/modals";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Ván chơi — Das Kapitalist" },
      {
        name: "description",
        content: "Bảng điều khiển xí nghiệp: c, v, m, tỷ suất lợi nhuận và các quyết định của nhà tư bản.",
      },
    ],
  }),
  component: GameScreen,
});

const profitTrend = [
  { q: "Q1", v: 6 },
  { q: "Q2", v: 9 },
  { q: "Q3", v: 12 },
  { q: "Q4", v: 10 },
  { q: "Q5", v: 14 },
  { q: "Q6", v: 17 },
  { q: "Q7", v: 18.4 },
];

const capitalRatio = [
  { name: "c", v: 62, color: "var(--color-info)" },
  { name: "v", v: 22, color: "var(--gold)" },
  { name: "m", v: 16, color: "var(--success)" },
];

const logEntries = [
  { t: "Q7", type: "event", text: "Công nhân phân xưởng dệt đình công đòi giảm giờ làm." },
  { t: "Q7", type: "decision", text: "Bạn đã mua thêm 4 máy dệt hơi nước ($12.000)." },
  { t: "Q6", type: "concept", text: "Khái niệm mới mở khoá: Tỷ suất bóc lột (m′)." },
  { t: "Q6", type: "event", text: "Giá bông thô tăng 8% do khủng hoảng thuộc địa." },
  { t: "Q5", type: "decision", text: "Bạn đã kéo dài ngày làm việc từ 12 → 14 giờ." },
  { t: "Q4", type: "event", text: "Nghị viện đề xuất Luật Xưởng máy (Factory Act)." },
];

function GameScreen() {
  const [event, setEvent] = useState(false);
  const [concept, setConcept] = useState(false);
  const [summary, setSummary] = useState(false);

  return (
    <>
      <MobileWarning />
      <div className="hidden min-h-screen flex-col gap-3 p-3 lg:flex">
        <GameHeader
          turn={7}
          quarter="Quý III · 1857"
          company="Xưởng Dệt Manchester"
          money={120_000}
          onPause={() => setSummary(true)}
        />

        <div className="grid flex-1 grid-cols-12 gap-3 min-h-0">
          {/* LEFT PANEL — Factory */}
          <section className="col-span-3 flex flex-col gap-3 min-h-0">
            <FactoryScene />
            <div className="panel-industrial rounded-lg p-4">
              <SectionTitle icon={<Users className="h-3.5 w-3.5" />} label="Lực lượng lao động" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniStat label="Công nhân" value="85" mono />
                <MiniStat label="Thất nghiệp" value="12" mono tone="danger" />
                <StatBar label="Sức khoẻ" value={78} tone="success" icon={<Heart className="h-3 w-3" />} />
                <StatBar
                  label="Tinh thần"
                  value={54}
                  tone="gold"
                  icon={<Activity className="h-3 w-3" />}
                />
              </div>
              <div className="mt-4 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" /> Tồn kho
                  </span>
                  <span className="font-mono text-foreground">1.240 / 2.000</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-panel-elevated">
                  <div className="h-full w-[62%] rounded bg-gradient-to-r from-primary to-[color:var(--info)]" />
                </div>
              </div>
            </div>
          </section>

          {/* CENTER PANEL — Dashboard */}
          <section className="col-span-6 flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-4 gap-3">
              <DashboardCard
                label="Tư bản bất biến"
                symbol="c"
                value={78_500}
                prefix="$"
                icon={Cog}
                tone="info"
                hint="Máy móc, nguyên liệu"
              />
              <DashboardCard
                label="Tư bản khả biến"
                symbol="v"
                value={22_800}
                prefix="$"
                icon={Users}
                tone="gold"
                hint="Tiền lương công nhân"
              />
              <DashboardCard
                label="Giá trị thặng dư"
                symbol="m"
                value={18_600}
                prefix="$"
                icon={TrendingUp}
                tone="success"
                hint="m′ = 82%"
              />
              <DashboardCard
                label="Tỷ suất lợi nhuận"
                symbol="p′ = m / (c+v)"
                value={18.4}
                suffix="%"
                decimals={1}
                icon={Zap}
                tone="gold"
                hint="Xu hướng: ↗ nhẹ"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ChartCard title="Xu hướng lợi nhuận" hint="p′ theo quý">
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={profitTrend} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="q" hide />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.18 0.006 60)",
                        border: "1px solid oklch(0.32 0.008 60)",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                      labelStyle={{ color: "oklch(0.7 0.02 70)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--gold)"
                      strokeWidth={2}
                      fill="url(#pg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Cơ cấu tư bản" hint="c : v : m">
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart
                    data={capitalRatio}
                    layout="vertical"
                    margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                  >
                    <Tooltip
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
                  <span><span className="text-[color:var(--info)]">■</span> c 62%</span>
                  <span><span className="text-gold">■</span> v 22%</span>
                  <span><span className="text-[color:var(--success)]">■</span> m 16%</span>
                </div>
              </ChartCard>

              <ChartCard title="Mâu thuẫn giai cấp" hint="Ngưỡng cách mạng · 100">
                <div className="mt-2 flex h-[110px] flex-col justify-center">
                  <div className="mb-1 flex items-end justify-between">
                    <span className="font-mono text-4xl text-[color:var(--contradiction)]">52</span>
                    <span className="font-mono text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded bg-panel-elevated">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "52%" }}
                      transition={{ duration: 1 }}
                      className="h-full rounded bg-gradient-to-r from-[color:var(--gold)] via-[color:var(--danger)] to-[color:var(--contradiction)]"
                    />
                    <div className="absolute inset-y-0 left-[75%] w-px bg-destructive/70" />
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 text-[color:var(--contradiction)]" />
                    Xu hướng: căng thẳng
                  </div>
                </div>
              </ChartCard>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-3 min-h-0">
              <MarketCard label="Cầu thị trường" value="1.780" unit="đvsp" tone="info" delta="+4%" />
              <MarketCard label="Cung của bạn" value="1.240" unit="đvsp" tone="gold" delta="+2%" />
              <MarketCard label="Giá bán" value="$38" unit="/đv" tone="success" delta="−1%" />
              <MarketCard label="Tồn kho" value="640" unit="đvsp" tone="danger" delta="+18%" />
            </div>

            {/* Bottom log */}
            <div className="panel-industrial flex min-h-[190px] flex-col rounded-lg p-4">
              <div className="flex items-center justify-between">
                <SectionTitle icon={<Clock className="h-3.5 w-3.5" />} label="Nhật ký · Dòng thời gian" />
                <button
                  onClick={() => setConcept(true)}
                  className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-gold"
                >
                  <BookOpen className="h-3 w-3" /> Từ điển khái niệm
                </button>
              </div>
              <div className="mt-3 flex-1 overflow-y-auto pr-1">
                <ul className="space-y-1.5">
                  {logEntries.map((l, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded border border-border/40 bg-panel-elevated/40 px-3 py-1.5 text-xs"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">{l.t}</span>
                      <LogIcon type={l.type} />
                      <span className="text-foreground">{l.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL — Decisions */}
          <section className="col-span-3 flex flex-col gap-3 min-h-0">
            <div className="panel-industrial rounded-lg p-4">
              <SectionTitle
                icon={<Info className="h-3.5 w-3.5" />}
                label="Quyết định của nhà tư bản"
                right={<span className="font-mono text-[10px] text-muted-foreground">3 / 3 lượt</span>}
              />
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 min-h-0 flex-1">
              <ActionButton
                icon={Clock}
                title="Tăng giờ làm việc"
                description="Kéo dài ngày lao động thêm 2 giờ."
                cost="$0"
                previews={[
                  { label: "m′", value: "+8%", tone: "up" },
                  { label: "Sức khoẻ", value: "−6", tone: "down" },
                  { label: "Mâu thuẫn", value: "+4", tone: "warn" },
                ]}
                onClick={() => setEvent(true)}
              />
              <ActionButton
                icon={DollarSign}
                title="Nâng tiền lương"
                description="Tăng v để xoa dịu công nhân."
                cost="$4.500 /quý"
                previews={[
                  { label: "Tinh thần", value: "+12", tone: "up" },
                  { label: "p′", value: "−2%", tone: "down" },
                ]}
              />
              <ActionButton
                icon={Cog}
                title="Mua máy móc"
                description="Tăng năng suất, tăng c."
                cost="$18.000"
                previews={[
                  { label: "Sản lượng", value: "+22%", tone: "up" },
                  { label: "p′", value: "−3%", tone: "down" },
                ]}
              />
              <ActionButton
                icon={Warehouse}
                title="Mở rộng xưởng"
                description="Xây phân xưởng mới."
                cost="$32.000"
                previews={[
                  { label: "Quy mô", value: "+40%", tone: "up" },
                  { label: "Rủi ro", value: "+8", tone: "warn" },
                ]}
              />
              <ActionButton
                icon={UserMinus}
                title="Cắt giảm nhân công"
                description="Sa thải 12 công nhân."
                cost="$0"
                previews={[
                  { label: "Chi phí v", value: "−$3.200", tone: "up" },
                  { label: "Mâu thuẫn", value: "+9", tone: "warn" },
                ]}
              />
              <ActionButton
                icon={Landmark}
                title="Vay tư bản"
                description="Vay ngân hàng 6% / quý."
                cost="$25.000"
                previews={[
                  { label: "Tiền mặt", value: "+$25k", tone: "up" },
                  { label: "Nợ", value: "+$26.5k", tone: "down" },
                ]}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSummary(true)}
              className="relative overflow-hidden rounded-lg border-2 border-primary bg-gradient-to-b from-[oklch(0.8_0.14_78)] to-[oklch(0.62_0.14_70)] px-6 py-4 font-display text-base font-bold uppercase tracking-[0.3em] text-[oklch(0.15_0.01_60)] shadow-[0_10px_30px_oklch(0.4_0.1_60/0.4),inset_0_2px_0_oklch(0.95_0.05_80/0.6)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Kết thúc quý <ChevronRight className="h-5 w-5" />
              </span>
              <span className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.2 0.01 60 / 0.3) 6px 8px)" }} />
            </motion.button>
          </section>
        </div>

        {/* Floating dev links to ending screens */}
        <div className="fixed bottom-3 right-3 z-40 flex gap-2 rounded-md border border-border bg-panel/80 p-1.5 font-mono text-[10px] backdrop-blur">
          <span className="px-1.5 py-0.5 text-muted-foreground">DEV</span>
          <Link to="/ending/revolution" className="rounded bg-destructive/20 px-2 py-0.5 text-destructive hover:bg-destructive/30">
            <Flag className="mr-1 inline h-3 w-3" />
            Ending: Cách mạng
          </Link>
          <Link to="/ending/bankruptcy" className="rounded bg-[color:var(--info)]/15 px-2 py-0.5 text-[color:var(--info)] hover:bg-[color:var(--info)]/25">
            Ending: Phá sản
          </Link>
        </div>

        <EventModal
          open={event}
          onClose={() => setEvent(false)}
          onAccept={() => setEvent(false)}
          onIgnore={() => setEvent(false)}
        />
        <ConceptModal open={concept} onClose={() => setConcept(false)} />
        <TurnSummaryModal open={summary} onClose={() => setSummary(false)} />
      </div>
    </>
  );
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
    <div className="flex items-center justify-between">
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
    tone === "danger"
      ? "text-destructive"
      : tone === "gold"
        ? "text-gold"
        : "text-foreground";
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
        <span className="flex items-center gap-1">{icon} {label}</span>
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
  delta,
}: {
  label: string;
  value: string;
  unit: string;
  tone: "info" | "gold" | "success" | "danger";
  delta: string;
}) {
  const c = {
    info: "text-[color:var(--info)]",
    gold: "text-gold",
    success: "text-[color:var(--success)]",
    danger: "text-destructive",
  }[tone];
  const isNeg = delta.startsWith("−");
  return (
    <div className="panel-industrial rounded-lg p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`font-mono text-2xl ${c}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
      <div
        className={`mt-1 font-mono text-[11px] ${
          isNeg ? "text-destructive" : "text-[color:var(--success)]"
        }`}
      >
        {delta} so với quý trước
      </div>
    </div>
  );
}

function LogIcon({ type }: { type: string }) {
  if (type === "event")
    return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[color:var(--contradiction)]" />;
  if (type === "concept")
    return <BookOpen className="h-3.5 w-3.5 shrink-0 text-[color:var(--info)]" />;
  return <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold" />;
}
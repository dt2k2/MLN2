import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, Trophy, BookOpen, Users } from "lucide-react";
import { Gear, Smoke, Embers } from "@/components/game/particles";
import { MobileWarning } from "@/components/game/mobile-warning";
import { useGameStore } from "@/game/state";

export const Route = createFileRoute("/")({
  component: MenuScreen,
});

function MenuScreen() {
  const reset = useGameStore((store) => store.reset);
  return (
    <>
      <MobileWarning />
      <main className="relative hidden min-h-screen overflow-hidden lg:block">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.25_0.04_45)] via-[oklch(0.16_0.02_40)] to-[oklch(0.1_0.01_35)]" />

        {/* Distant factory silhouette */}
        <svg
          viewBox="0 0 1600 400"
          className="absolute inset-x-0 bottom-0 h-[45vh] w-full opacity-70"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <linearGradient id="fac" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.14 0.008 40)" />
              <stop offset="100%" stopColor="oklch(0.08 0.005 35)" />
            </linearGradient>
          </defs>
          <path
            d="M0 400 L0 260 L120 260 L120 180 L160 180 L160 260 L260 260 L260 220 L340 220 L340 130 L380 130 L380 220 L520 220 L520 200 L620 200 L620 90 L660 90 L660 200 L820 200 L820 240 L920 240 L920 160 L960 160 L960 240 L1120 240 L1120 210 L1200 210 L1200 110 L1240 110 L1240 210 L1380 210 L1380 250 L1500 250 L1500 190 L1600 190 L1600 400 Z"
            fill="url(#fac)"
          />
        </svg>

        {/* Smoke */}
        <div className="absolute inset-x-0 bottom-[35vh] h-[30vh]">
          <Smoke />
        </div>

        {/* Giant background gears */}
        <div className="absolute -left-24 top-1/4 text-primary/10">
          <Gear size={420} slow />
        </div>
        <div className="absolute -right-32 top-1/3 text-primary/10">
          <Gear size={520} reverse />
        </div>

        <Embers count={40} />

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.05_0.005_30/0.85)_100%)]" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mb-2 font-mono text-xs uppercase tracking-[0.5em] text-primary/70">
              Mô phỏng Kinh tế Chính trị
            </div>
            <h1 className="font-display text-8xl font-bold uppercase tracking-widest text-gold drop-shadow-[0_4px_20px_oklch(0.5_0.1_60/0.6)]">
              Das Kapitalist
            </h1>
            <div className="mx-auto mt-4 h-px w-96 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Bạn là một nhà tư bản của thế kỷ 19. Vận hành xí nghiệp, quyết định số phận công nhân,
              và đối diện những mâu thuẫn không thể tránh khỏi của phương thức sản xuất tư bản chủ
              nghĩa qua <span className="text-gold">24 quý</span>.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
            }}
            className="mt-14 grid w-full max-w-md gap-3"
          >
            <MenuButton
              to="/game"
              icon={<Play className="h-5 w-5" />}
              label="Ván mới"
              primary
              onClick={reset}
            />
            <MenuButton
              to="/leaderboard"
              icon={<Trophy className="h-5 w-5" />}
              label="Bảng xếp hạng"
            />
            <MenuButton
              to="/how-to-play"
              icon={<BookOpen className="h-5 w-5" />}
              label="Hướng dẫn chơi"
            />
            <MenuButton to="/credits" icon={<Users className="h-5 w-5" />} label="Đội ngũ" />
          </motion.div>

          <div className="absolute bottom-6 left-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="text-primary">
              <Gear size={14} />
            </span>
            v0.1.0 — Prototype
          </div>
          <div className="absolute bottom-6 right-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            © MMXXVI · Trust of Iron & Coal
          </div>
        </div>
      </main>
    </>
  );
}

function MenuButton({
  to,
  icon,
  label,
  primary,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
      <Link
        to={to}
        onClick={onClick}
        className={`group flex items-center justify-between rounded-md border px-5 py-3 font-display text-base uppercase tracking-[0.25em] transition-all ${
          primary
            ? "border-primary/70 bg-primary/15 text-gold shadow-[0_0_30px_oklch(0.5_0.1_60/0.25)] hover:bg-primary/25 hover:shadow-[0_0_45px_oklch(0.55_0.13_60/0.4)]"
            : "border-border/60 bg-panel/60 text-foreground hover:border-primary/50 hover:text-gold"
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {label}
        </span>
        <span className="font-mono text-xs opacity-60 transition group-hover:opacity-100">→</span>
      </Link>
    </motion.div>
  );
}

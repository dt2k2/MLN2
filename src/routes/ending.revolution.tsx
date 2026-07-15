import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flag, RotateCcw, Trophy } from "lucide-react";
import { EndingDossier } from "@/components/game/ending-dossier";
import { Embers, Smoke } from "@/components/game/particles";
import { useGameStore } from "@/game/state";
import { useEndingReport } from "@/game/use-ending-report";

export const Route = createFileRoute("/ending/revolution")({
  head: () => ({
    meta: [
      { title: "Cách mạng vô sản — Das Kapitalist" },
      {
        name: "description",
        content: "Kết cục: mâu thuẫn giai cấp vượt ngưỡng, công nhân đã nổi dậy.",
      },
    ],
  }),
  component: RevolutionEnding,
});

function RevolutionEnding() {
  const reset = useGameStore((store) => store.reset);
  const state = useGameStore((store) => store.state);
  const report = useEndingReport(state, "revolution");
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.12_25)] via-[oklch(0.15_0.15_22)] to-[oklch(0.08_0.05_20)]"
      />

      {/* Burning factory silhouette */}
      <svg
        viewBox="0 0 1600 500"
        className="absolute inset-x-0 bottom-0 h-[55vh] w-full"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 500 L0 320 L180 320 L180 220 L240 220 L240 320 L380 320 L380 260 L460 260 L460 160 L500 160 L500 260 L680 260 L680 240 L800 240 L800 120 L840 120 L840 240 L1000 240 L1000 300 L1120 300 L1120 200 L1160 200 L1160 300 L1340 300 L1340 280 L1440 280 L1440 220 L1600 220 L1600 500 Z"
          fill="oklch(0.08 0.02 25)"
        />
      </svg>

      {/* Smoke of fire */}
      <div className="absolute inset-x-0 bottom-1/4 h-[40vh]">
        <Smoke />
      </div>
      <Embers count={80} />

      {/* Silhouette of workers with flags */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.05, duration: 0.6 }}
            className="relative"
          >
            <div className="h-16 w-4 rounded-t-full bg-black" />
            {i % 2 === 0 ? (
              <>
                <div className="absolute -top-14 left-1/2 h-14 w-0.5 -translate-x-1/2 bg-black" />
                <motion.div
                  animate={{ skewX: [-3, 3, -3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -top-14 left-1/2 h-6 w-8 origin-left bg-[oklch(0.55_0.22_25)] shadow-[0_0_10px_oklch(0.55_0.22_25)]"
                />
              </>
            ) : null}
          </motion.div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,oklch(0.05_0.05_20/0.9)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-10 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <Flag className="mx-auto h-16 w-16 text-[oklch(0.65_0.22_25)] drop-shadow-[0_0_20px_oklch(0.55_0.22_25)]" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="mt-6 font-display text-3xl font-bold uppercase tracking-wider text-[oklch(0.85_0.18_28)] drop-shadow-[0_4px_20px_oklch(0.5_0.2_25/0.8)] sm:text-7xl sm:tracking-widest"
        >
          Cách mạng đã nổ ra
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.5 }}
          className="mt-3 font-mono text-xs uppercase tracking-[0.5em] text-[oklch(0.7_0.15_28)]"
        >
          The Revolution has Begun
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-10 max-w-2xl rounded-lg border border-[oklch(0.45_0.15_25)]/50 bg-black/50 p-6 text-left backdrop-blur"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[oklch(0.7_0.15_28)]">
            Kết cục lịch sử
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[oklch(0.9_0.02_30)]">
            {report.thesis} Những lựa chọn trong xưởng đã tác động đến nhịp tích tụ xung đột, nhưng
            kết cục cũng hình thành từ quan hệ lao động và sức ép xã hội vượt ra ngoài ý chí của một
            chủ xưởng.
          </p>
          <p className="mt-3 text-sm italic leading-relaxed text-[oklch(0.75_0.05_30)]">
            "Giai cấp tư sản, do đó, đã tạo ra những vũ khí sẽ giết chết chính mình; nó cũng đã tạo
            ra những người sẽ sử dụng những vũ khí ấy — giai cấp vô sản hiện đại."
            <span className="ml-2 text-[oklch(0.7_0.15_28)]">— Tuyên ngôn Đảng Cộng sản</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <EndingDossier report={report} />
          <Link
            to="/game"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-[oklch(0.6_0.2_25)]/70 bg-[oklch(0.4_0.15_25)]/40 px-6 py-3 font-display text-sm uppercase tracking-widest text-[oklch(0.9_0.1_28)] hover:bg-[oklch(0.5_0.18_25)]/40"
          >
            <RotateCcw className="h-4 w-4" /> Chơi lại
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-panel/60 px-6 py-3 font-display text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <Trophy className="h-4 w-4" /> Bảng xếp hạng
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RotateCcw, Trophy, TrendingDown } from "lucide-react";
import { Gear } from "@/components/game/particles";
import { useGameStore } from "@/game/state";

export const Route = createFileRoute("/ending/bankruptcy")({
  head: () => ({
    meta: [
      { title: "Phá sản — Das Kapitalist" },
      {
        name: "description",
        content:
          "Kết cục: tư bản của bạn đã sụp đổ dưới quy luật xu hướng giảm sút của tỷ suất lợi nhuận.",
      },
    ],
  }),
  component: BankruptcyEnding,
});

function BankruptcyEnding() {
  const reset = useGameStore((store) => store.reset);
  return (
    <main className="relative min-h-screen overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5 }}
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.28_0.03_235)] via-[oklch(0.18_0.02_230)] to-[oklch(0.1_0.01_225)]"
      />

      {/* Broken factory silhouette */}
      <svg
        viewBox="0 0 1600 500"
        className="absolute inset-x-0 bottom-0 h-[55vh] w-full"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 500 L0 340 L160 340 L160 230 L200 230 L200 280 L220 280 L220 340 L360 340 L360 300 L440 300 L440 200 L470 200 L470 240 L480 240 L480 300 L640 300 L640 280 L760 280 L760 160 L790 160 L790 200 L800 200 L800 280 L960 280 L960 320 L1080 320 L1080 240 L1110 240 L1110 320 L1300 320 L1300 300 L1400 300 L1400 260 L1600 260 L1600 500 Z"
          fill="oklch(0.06 0.01 230)"
        />
        {/* broken pipes */}
        <line x1="240" y1="230" x2="260" y2="200" stroke="oklch(0.15 0.01 230)" strokeWidth="4" />
        <line x1="790" y1="160" x2="810" y2="130" stroke="oklch(0.15 0.01 230)" strokeWidth="4" />
      </svg>

      {/* Frozen fog */}
      <div className="absolute inset-x-0 top-1/3 h-[35vh] bg-gradient-to-b from-[oklch(0.55_0.03_235)/0.15] to-transparent blur-2xl" />

      {/* Slow broken gears */}
      <div className="absolute -left-16 bottom-24 text-[oklch(0.35_0.03_235)]/40">
        <Gear size={260} slow />
      </div>
      <div className="absolute -right-16 top-32 text-[oklch(0.35_0.03_235)]/30">
        <Gear size={200} reverse />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,oklch(0.05_0.01_225/0.9)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <TrendingDown className="mx-auto h-16 w-16 text-[oklch(0.75_0.1_235)] drop-shadow-[0_0_20px_oklch(0.5_0.1_235)]" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="mt-6 font-display text-7xl font-bold uppercase tracking-widest text-[oklch(0.9_0.05_230)] drop-shadow-[0_4px_20px_oklch(0.3_0.05_235/0.8)]"
        >
          Tư bản đã sụp đổ
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.5 }}
          className="mt-3 font-mono text-xs uppercase tracking-[0.5em] text-[oklch(0.7_0.08_235)]"
        >
          Your Capital has Collapsed
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-10 max-w-2xl rounded-lg border border-[oklch(0.4_0.08_235)]/60 bg-black/50 p-6 text-left backdrop-blur"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[oklch(0.7_0.08_235)]">
            Phân tích kinh tế
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[oklch(0.9_0.02_230)]">
            Đầu tư ồ ạt vào tư bản bất biến (c) mà không tăng tương ứng phần khả biến (v) đã kéo{" "}
            <span className="text-[oklch(0.85_0.12_235)]">cấu tạo hữu cơ của tư bản</span> lên cao.
            Theo quy luật xu hướng giảm sút của tỷ suất lợi nhuận, p′ = m/(c+v) tụt xuống đến mức
            không đủ trả lãi vay. Xưởng đóng cửa, máy móc rỉ sét, công nhân đói khát tản mát.
          </p>
          <p className="mt-3 text-sm italic leading-relaxed text-[oklch(0.75_0.05_235)]">
            "Rào cản thực sự của nền sản xuất tư bản chủ nghĩa chính là bản thân tư bản."
            <span className="ml-2 text-[oklch(0.7_0.1_235)]">— K. Marx, Tư bản III</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="mt-8 flex gap-3"
        >
          <Link
            to="/game"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-[oklch(0.5_0.12_235)]/70 bg-[oklch(0.3_0.08_235)]/40 px-6 py-3 font-display text-sm uppercase tracking-widest text-[oklch(0.9_0.08_230)] hover:bg-[oklch(0.4_0.1_235)]/40"
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

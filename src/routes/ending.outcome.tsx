import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock3, RotateCcw, Scale, Trophy } from "lucide-react";
import { z } from "zod";
import { useGameStore } from "@/game/state";

const resultSchema = z.object({
  result: z.enum(["monopoly", "reform", "timeout"]),
});

const OUTCOMES = {
  monopoly: {
    eyebrow: "Kết cục: Độc quyền",
    title: "Tư bản tập trung vào một bàn tay",
    description:
      "Xưởng của bạn đã thâu tóm phần lớn thị trường. Cạnh tranh sinh ra tập trung tư bản; thành công của một nhà tư bản đồng thời thu hẹp không gian tồn tại của những nhà tư bản khác.",
    Icon: Trophy,
  },
  reform: {
    eyebrow: "Kết cục: Cải cách",
    title: "Một thế cân bằng tạm thời",
    description:
      "Lợi nhuận vẫn dương trong khi sức khỏe công nhân và mâu thuẫn xã hội được giữ trong giới hạn. Những nhượng bộ đã kéo dài sự ổn định, nhưng không xóa bỏ động lực tích lũy của hệ thống.",
    Icon: Scale,
  },
  timeout: {
    eyebrow: "Kết cục: Hết thời kỳ",
    title: "Xưởng còn đứng, câu hỏi vẫn mở",
    description:
      "Sau 24 lượt, doanh nghiệp không sụp đổ cũng chưa đạt thế độc quyền hay cải cách bền vững. Các xu hướng kinh tế vẫn tiếp tục vận động ngoài khung thời gian của ván chơi.",
    Icon: Clock3,
  },
} as const;

export const Route = createFileRoute("/ending/outcome")({
  validateSearch: resultSchema,
  head: () => ({
    meta: [
      { title: "Kết cục lịch sử — Das Kapitalist" },
      { name: "description", content: "Tổng kết kết cục của xưởng sau 24 lượt." },
    ],
  }),
  component: OutcomeEnding,
});

function OutcomeEnding() {
  const { result } = Route.useSearch();
  const outcome = OUTCOMES[result as keyof typeof OUTCOMES];
  const Icon = outcome.Icon;
  const reset = useGameStore((store) => store.reset);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.11_0.01_60)] px-5">
      <div className="absolute inset-x-0 bottom-0 h-1/2 border-t border-primary/20 bg-[oklch(0.15_0.015_70)]" />
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-3xl border border-primary/40 bg-panel/95 p-7 text-center shadow-2xl sm:p-12"
      >
        <Icon className="mx-auto h-12 w-12 text-gold" />
        <div className="mt-5 font-mono text-[10px] uppercase tracking-widest text-primary">
          {outcome.eyebrow}
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold text-gold sm:text-6xl">
          {outcome.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
          {outcome.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/game"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 font-display text-sm font-semibold text-[oklch(0.15_0.01_60)]"
          >
            <RotateCcw className="h-4 w-4" /> Chơi lại
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-display text-sm text-foreground"
          >
            <Trophy className="h-4 w-4" /> Bảng xếp hạng
          </Link>
        </div>
      </motion.section>
    </main>
  );
}

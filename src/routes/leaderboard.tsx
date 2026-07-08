import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Trophy, Flag } from "lucide-react";
import { Gear } from "@/components/game/particles";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Bảng xếp hạng — Das Kapitalist" },
      { name: "description", content: "Những nhà tư bản sống sót lâu nhất và những kẻ đã bị lịch sử lật đổ." },
    ],
  }),
  component: Leaderboard,
});

const rows = [
  { rank: 1, name: "F. Engels", company: "Ermen & Engels", profit: 342_000, turns: 24, end: "Sống sót" },
  { rank: 2, name: "R. Owen", company: "New Lanark Mills", profit: 268_400, turns: 24, end: "Sống sót" },
  { rank: 3, name: "T. Arkwright", company: "Cromford Cotton", profit: 214_800, turns: 22, end: "Phá sản" },
  { rank: 4, name: "J. Peel", company: "Peel Textile Co.", profit: 198_500, turns: 20, end: "Cách mạng" },
  { rank: 5, name: "H. Cort", company: "Iron Works", profit: 176_200, turns: 19, end: "Phá sản" },
  { rank: 6, name: "M. Boulton", company: "Soho Manufactory", profit: 148_900, turns: 17, end: "Cách mạng" },
  { rank: 7, name: "J. Watt", company: "Steam & Co.", profit: 121_400, turns: 15, end: "Phá sản" },
  { rank: 8, name: "Bạn", company: "Xưởng Dệt Manchester", profit: 98_600, turns: 12, end: "Đang chơi", highlight: true },
];

function Leaderboard() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute -left-20 top-20 text-primary/10">
        <Gear size={340} slow />
      </div>
      <div className="absolute -right-24 bottom-10 text-primary/10">
        <Gear size={280} reverse />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Về sảnh chính
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <Trophy className="h-8 w-8 text-gold" />
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/70">
              Sổ ghi công của giai cấp tư sản
            </div>
            <h1 className="font-display text-5xl font-bold uppercase tracking-widest text-gold">
              Bảng xếp hạng
            </h1>
          </div>
        </div>

        <div className="panel-industrial mt-8 overflow-hidden rounded-lg">
          <div className="grid grid-cols-[60px_1fr_1fr_140px_100px_140px] gap-4 border-b border-border/60 bg-panel-elevated/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span>#</span>
            <span>Nhà tư bản</span>
            <span>Xí nghiệp</span>
            <span className="text-right">Lợi nhuận</span>
            <span className="text-right">Trụ vững</span>
            <span className="text-right">Kết cục</span>
          </div>
          {rows.map((r) => (
            <div
              key={r.rank}
              className={`grid grid-cols-[60px_1fr_1fr_140px_100px_140px] items-center gap-4 border-b border-border/40 px-5 py-3 text-sm last:border-b-0 transition-colors ${
                r.highlight ? "bg-primary/10" : "hover:bg-panel-elevated/40"
              }`}
            >
              <span className="font-display text-xl text-gold">{r.rank}</span>
              <span className="font-medium text-foreground">{r.name}</span>
              <span className="text-muted-foreground">{r.company}</span>
              <span className="text-right font-mono text-gold">
                ${r.profit.toLocaleString("vi-VN")}
              </span>
              <span className="text-right font-mono text-muted-foreground">{r.turns}/24</span>
              <span
                className={`flex items-center justify-end gap-1 text-right font-mono text-xs ${
                  r.end === "Sống sót"
                    ? "text-[color:var(--success)]"
                    : r.end === "Cách mạng"
                      ? "text-destructive"
                      : r.end === "Phá sản"
                        ? "text-[color:var(--info)]"
                        : "text-gold"
                }`}
              >
                {r.end === "Cách mạng" ? <Flag className="h-3 w-3" /> : null}
                {r.end}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
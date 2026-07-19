import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Gear } from "@/components/game/particles";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Đội ngũ — Das Kapitalist" },
      { name: "description", content: "Đội ngũ thực hiện, tài liệu tham khảo và lời cảm ơn." },
    ],
  }),
  component: Credits,
});

const sections = [
  {
    title: "Nhóm thực hiện — IA1908 Group 2",
    items: [
      "SE161931 · Bùi Đức Thắng",
      "SE170105 · Nguyễn Lê Đăng Khoa",
      "SE185070 · Trần Hồ Phương Khanh",
      "SE192802 · Lưu Ngọc Ngân Giang",
    ],
  },
  {
    title: "Thiết kế trò chơi",
    items: ["Das Kapitalist Studio", "Tổ nghiên cứu Kinh tế Chính trị"],
  },
  {
    title: "Lập trình & UI",
    items: ["Kỹ sư giao diện", "Hoạ sĩ minh hoạ công nghiệp", "Kỹ sư mô phỏng"],
  },
  {
    title: "Cảm hứng thị giác",
    items: [
      "Frostpunk (11 bit)",
      "Victoria 3 (Paradox)",
      "Anno 1800",
      "Papers Please",
      "Disco Elysium",
    ],
  },
  {
    title: "Tài liệu tham khảo",
    items: [
      "K. Marx — Tư Bản, Quyển I (1867)",
      "F. Engels — Tình cảnh giai cấp lao động ở Anh (1845)",
      "V. I. Lênin — Chủ nghĩa đế quốc, giai đoạn tột cùng của chủ nghĩa tư bản (1917)",
      "Giáo trình Kinh tế Chính trị Mác - Lênin, NXB Chính trị Quốc gia",
    ],
  },
  {
    title: "Hỗ trợ kỹ thuật",
    items: ["Lovable"],
  },
];

function Credits() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute left-1/2 top-20 -translate-x-1/2 text-primary/10">
        <Gear size={520} slow />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Về sảnh chính
        </Link>

        <div className="mt-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/70">
            Anno MMXXVI
          </div>
          <h1 className="font-display text-5xl font-bold uppercase tracking-widest text-gold">
            Đội ngũ
          </h1>
          <div className="mx-auto mt-4 h-px w-64 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <p className="mt-4 text-sm italic text-muted-foreground">
            "Lịch sử của mọi xã hội tồn tại từ trước đến nay là lịch sử đấu tranh giai cấp."
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {sections.map((s) => (
            <section key={s.title} className="panel-industrial rounded-lg p-5">
              <h2 className="font-display text-sm uppercase tracking-[0.25em] text-gold">
                {s.title}
              </h2>
              <div className="mt-3 h-px bg-border/60" />
              <ul className="mt-3 space-y-1.5">
                {s.items.map((i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          © MMXXVI · Trust of Iron & Coal · v1.0.0
        </div>
      </div>
    </main>
  );
}

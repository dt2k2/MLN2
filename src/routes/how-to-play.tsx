import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock, Users, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Gear } from "@/components/game/particles";
import { useTutorialStore } from "@/tutorial/state";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "Hướng dẫn — Das Kapitalist" },
      {
        name: "description",
        content: "Cách chơi, các chỉ số kinh tế và ý nghĩa Marxist của mỗi quyết định.",
      },
    ],
  }),
  component: HowToPlay,
});

const concepts = [
  {
    icon: TrendingUp,
    symbol: "c",
    title: "Tư bản bất biến",
    body: "Giá trị của máy móc, thiết bị và nguyên liệu. Không tự tạo ra giá trị mới, chỉ chuyển giá trị sang sản phẩm.",
  },
  {
    icon: Users,
    symbol: "v",
    title: "Tư bản khả biến",
    body: "Phần tư bản dùng để mua sức lao động (tiền lương). Đây là nguồn duy nhất sinh ra giá trị mới trong quá trình sản xuất.",
  },
  {
    icon: BookOpen,
    symbol: "m",
    title: "Giá trị thặng dư",
    body: "Phần giá trị công nhân tạo ra vượt quá tiền lương, bị nhà tư bản chiếm hữu. Nền tảng của lợi nhuận.",
  },
  {
    icon: Clock,
    symbol: "p′",
    title: "Tỷ suất lợi nhuận",
    body: "p′ = m / (c + v). Theo Marx, có xu hướng giảm dần khi c tăng nhanh hơn v — quy luật xu hướng giảm sút của tỷ suất lợi nhuận.",
  },
  {
    icon: AlertTriangle,
    symbol: "⚙",
    title: "Mâu thuẫn giai cấp",
    body: "Đo lường căng thẳng giữa tư bản và lao động. Vượt ngưỡng 100 sẽ dẫn tới cách mạng vô sản.",
  },
  {
    icon: Clock,
    symbol: "24",
    title: "24 quý",
    body: "Ván chơi kéo dài đúng 24 quý (6 năm). Mỗi lượt bạn có thể ra tối đa 3 quyết định trước khi kết thúc quý.",
  },
];

function HowToPlay() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute -right-32 top-40 text-primary/10">
        <Gear size={420} slow />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Về sảnh chính
        </Link>

        <div className="mt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/70">
            Sổ tay của nhà tư bản
          </div>
          <h1 className="font-display text-5xl font-bold uppercase tracking-widest text-gold">
            Hướng dẫn chơi
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Bạn đóng vai một nhà tư bản trong buổi bình minh của công nghiệp cơ khí. Nhiệm vụ của
            bạn không đơn thuần là tối đa hoá lợi nhuận — mà là{" "}
            <span className="text-gold">tồn tại</span> qua 24 quý mà không bị các quy luật khách
            quan của phương thức sản xuất tư bản chủ nghĩa nghiền nát.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl text-foreground">Ba chỉ số nền tảng</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {concepts.map((c) => (
              <div key={c.title} className="panel-industrial rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded border border-primary/40 bg-primary/10 p-1.5 text-primary">
                    <c.icon className="h-4 w-4" />
                  </div>
                  <div className="font-mono text-lg text-gold">{c.symbol}</div>
                </div>
                <h3 className="mt-3 font-display text-base text-foreground">{c.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">Quy trình một lượt</h2>
          <ol className="mt-4 space-y-3">
            {[
              "Quan sát bảng chỉ số kinh tế (c, v, m, p′) và tình trạng công nhân.",
              "Chọn tối đa 3 quyết định từ Bảng điều khiển bên phải.",
              "Đọc kỹ sự kiện bất ngờ — chúng phản ánh khủng hoảng khách quan của thị trường và giai cấp.",
              "Bấm KẾT THÚC QUÝ để hệ mô phỏng tính toán và chuyển sang quý kế tiếp.",
              "Sau 24 quý — hoặc khi Mâu thuẫn ≥ 100, hoặc khi Tiền mặt < 0 — ván chơi kết thúc.",
            ].map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-lg border border-border/60 bg-panel/60 px-4 py-3 text-sm"
              >
                <span className="font-display text-2xl text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pt-1 text-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="thi-truong" className="mt-12 panel-industrial rounded-lg p-5">
          <h2 className="font-display text-xl text-gold">Thị trường</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cầu hiệu dụng ngành là tổng lượng hàng thị trường có khả năng thanh toán — không phải mọi nhu cầu xã hội. Tổng cung ngành là sản lượng dự kiến của toàn bộ đối thủ cộng xưởng của bạn. Cầu dành cho xưởng là phần bạn có thể giành được theo thị phần. Sản xuất vượt con số này thường rơi vào tồn kho. Giá bán chịu tác động của giá trị xã hội, cung–cầu và cạnh tranh; giá cao chưa chắc thành lợi nhuận nếu hàng không bán được.
          </p>
        </section>

        <section id="cau-thanh-gia-tri" className="mt-6 panel-industrial rounded-lg p-5">
          <h2 className="font-display text-xl text-gold">Cấu thành giá trị (c, v, m)</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            c là giá trị tư liệu sản xuất được chuyển vào hàng hóa (nguyên liệu và khấu hao máy), không phải toàn bộ tiền mặt đã chi. v là phần vốn ứng ra để mua sức lao động. m là phần giá trị mới do lao động tạo ra vượt quá v — không đồng nhất với lợi nhuận kế toán, vì lợi nhuận còn phụ thuộc vào việc hàng bán được không. Tỷ lệ % là cơ cấu giá trị sản phẩm quý, không phải tỷ suất lợi nhuận.
          </p>
        </section>

        <section id="hieu-suat-von" className="mt-6 panel-industrial rounded-lg p-5">
          <h2 className="font-display text-xl text-gold">Xu hướng hiệu suất tổng vốn</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Biểu đồ theo dõi lợi nhuận kế toán so với vốn xưởng đã ứng, tính theo từng quý (không phải tỷ suất năm). Xu hướng đi xuống có thể do chi phí tăng, hàng không bán được, lãi vay hoặc vốn máy tăng nhanh hơn lợi nhuận. Một quý riêng lẻ không tạo thành xu hướng; cần vài quý liên tiếp mới nói được điều gì.
          </p>
        </section>

        <section id="ap-luc-xa-hoi" className="mt-6 panel-industrial rounded-lg p-5">
          <h2 className="font-display text-xl text-gold">Áp lực xã hội</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Áp lực xã hội tổng hợp sức khỏe, bất ổn, giờ làm, lương, thất nghiệp và các xung đột đang mở — không chỉ cộng thêm chỉ số bất ổn. Các dải: 0–29 Yên · 30–49 Căng nhẹ · 50–69 Bất ổn · 70–84 Nguy hiểm · 85–100 Đứt gãy. Vượt ngưỡng cao dễ dẫn tới đình công, bạo loạn hoặc kết cục xã hội nghiêm trọng.
          </p>
        </section>

        <section id="tai-chinh" className="mt-6 panel-industrial rounded-lg p-5">
          <h2 className="font-display text-xl text-gold">Tài chính: tiền mặt, quỹ tích lũy, nợ</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tiền mặt là toàn bộ số bạn có để mua máy, trả nợ và duy trì vận hành. Quỹ tích lũy là phần lợi nhuận giữ lại nằm chính trong tiền mặt — đừng cộng cash + quỹ tích lũy vì như vậy tính hai lần. Vay tín dụng làm tăng tiền mặt và dư nợ đồng thời; đó không phải lợi nhuận. Lãi quý tới ước tính chi phí tín dụng dựa trên dư nợ hiện hành. Tỷ lệ Nợ / Tài sản càng cao, xưởng càng dễ tổn thương khi lợi nhuận giảm.
          </p>
        </section>

        <section id="can-can-lich-su" className="mt-6 panel-industrial rounded-lg p-5">
          <h2 className="font-display text-xl text-gold">Cán cân Lịch sử</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cán cân đo ba <em>nguồn sức ép</em> đang định hình xưởng — không phải bảng điểm thắng/thua và không phải sức mạnh. Tư bản: sức ép từ tích lũy, máy móc, dư nợ, lỗ. Lao động: sức ép từ giờ làm, lương, sức khỏe, thất nghiệp, bất ổn. Thị trường: sức ép từ tồn kho, cạnh tranh và khả năng bán hàng. Trạng thái "Ổn định" chỉ nghĩa là chưa trục nào đủ lớn để chi phối; hai hoặc ba trục cùng cao báo hiệu một giải pháp đơn lẻ khó ổn định xưởng.
          </p>
        </section>


        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            to="/game"
            className="rounded-md border border-primary/70 bg-primary/15 px-8 py-3 font-display text-sm uppercase tracking-[0.3em] text-gold shadow-[0_0_30px_oklch(0.5_0.1_60/0.25)] hover:bg-primary/25"
          >
            Bắt đầu ván mới →
          </Link>
          <RestartTutorialButton />
        </div>
      </div>
    </main>
  );
}

function RestartTutorialButton() {
  const restart = useTutorialStore((s) => s.restart);
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        restart();
        navigate({ to: "/game" });
      }}
      className="flex items-center gap-2 rounded-md border border-border bg-panel-elevated px-6 py-3 font-display text-sm uppercase tracking-[0.3em] text-muted-foreground hover:border-primary/60 hover:text-gold"
    >
      <Lightbulb className="h-4 w-4" /> Chơi lại hướng dẫn
    </button>
  );
}

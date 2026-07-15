import type { GameState } from "@/game/types";
import { readScale } from "@/game/pressures";
import type { TutorialStep } from "./types";

const contradictionBand = (v: number) => {
  if (v < 30) return "Yên";
  if (v < 50) return "Căng nhẹ";
  if (v < 70) return "Bất ổn";
  if (v < 85) return "Nguy hiểm";
  return "Đứt gãy";
};

const axisDominant = (s: ReturnType<typeof readScale>) => {
  const items: Array<[string, number]> = [
    ["tài chính & tích lũy", s.capital],
    ["lao động", s.labor],
    ["thị trường", s.market],
  ];
  items.sort((a, b) => b[1] - a[1]);
  return items[0][0];
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "objective",
    advance: { kind: "manual" },
    pages: [
      {
        target: "header-turn",
        title: "Mục tiêu của trò chơi",
        body: "Bạn có 24 quý để điều hành xưởng dệt Müller & Söhne. Mỗi quý, bạn cân bằng ba sức ép: duy trì sản xuất, bảo vệ dòng tiền và kiểm soát xung đột xã hội. Không cần tối đa hóa mọi chỉ số — mỗi lựa chọn đều có cái giá của nó.",
        placement: "bottom",
      },
    ],
  },
  {
    id: "cash-debt",
    advance: { kind: "manual" },
    pages: [
      {
        target: "header-cash",
        title: "Tiền mặt và quỹ tích lũy",
        body: (s: GameState) =>
          `Xưởng đang có $${Math.round(s.cash).toLocaleString("vi-VN")} tiền mặt để mua máy, trả nợ và chống chịu các khoản chi. Quỹ tích lũy $${Math.round(s.accumulationFund).toLocaleString("vi-VN")} là phần lợi nhuận giữ lại — nó vẫn nằm trong tiền mặt của doanh nghiệp, không phải một tài khoản thứ hai được cộng thêm. Tiền mặt cao không đồng nghĩa xưởng có lãi vì một phần có thể đến từ vay nợ.`,
        placement: "bottom",
        learnMoreAnchor: "tai-chinh",
      },
      {
        target: "header-debt",
        title: "Dư nợ, lãi và tỷ lệ nợ",
        body: (s: GameState) => {
          const ratio = s.debt
            ? `${((s.debt / Math.max(1, s.cash + s.machineBookValue)) * 100).toFixed(0)}%`
            : "0%";
          return `Xưởng đang gánh $${Math.round(s.debt).toLocaleString("vi-VN")} nợ thừa kế. Mỗi quý phải trả lãi, và tỷ lệ Nợ / Tài sản khoảng ${ratio} — nợ càng chiếm phần lớn tài sản, xưởng càng dễ tổn thương khi lợi nhuận giảm hoặc tín dụng bị siết. Trả bớt nợ làm giảm lãi các quý sau; vay thêm làm tăng tiền mặt và nghĩa vụ nợ cùng lúc.`;
        },
        showIf: (s: GameState) => s.debt > 0,
        placement: "bottom",
        learnMoreAnchor: "tai-chinh",
      },
      {
        target: "header-cash",
        title: "Chưa có nợ",
        body: "Hiện xưởng không có dư nợ nên chưa phát sinh lãi. Nếu bạn vay sau này, mục Dư nợ, Lãi quý tới và Nợ / Tài sản sẽ hiện ra ngay tại header.",
        showIf: (s: GameState) => s.debt <= 0,
        placement: "bottom",
      },
    ],
  },
  {
    id: "indicators",
    advance: { kind: "manual" },
    pages: [
      {
        target: "dashboard-grid",
        title: "Cấu trúc giá trị một quý",
        body: "Trước khi quý đầu hoàn tất, bốn thẻ này là dự kiến theo điều kiện hiện tại và sẽ đổi khi bạn ra quyết định. Chi phí tư liệu gồm vật liệu và phần giá trị máy móc chuyển vào sản phẩm; quỹ lương là tiền trả cho lao động; giá trị dôi ra là phần lao động tạo thêm vượt quá lương. Hiệu suất vốn so sánh lợi nhuận kế toán dự kiến với tổng vốn ứng — kết quả thực chỉ được ghi nhận khi quý kết thúc.",
        placement: "right",
        learnMoreAnchor: "cau-thanh-gia-tri",
      },
      {
        target: "market-group-demand",
        title: "Cầu, cung và phần cầu của xưởng",
        body: (s: GameState) =>
          `Cầu hiệu dụng ngành (${s.effectiveDemand.toLocaleString("vi-VN")} đvsp) là lượng hàng toàn thị trường có khả năng thanh toán. Tổng cung ngành (${Math.round(s.industrySupply).toLocaleString("vi-VN")}) là sản lượng dự kiến của bạn và các đối thủ. Cầu dành cho xưởng (${s.demand.toLocaleString("vi-VN")}) là phần bạn có khả năng giành được dựa trên thị phần. Sản xuất vượt con số đó có nguy cơ nằm lại trong kho.`,
        placement: "bottom",
        learnMoreAnchor: "thi-truong",
      },
      {
        target: "market-group-output",
        title: "Sản lượng, giá bán và thị phần",
        body: (s: GameState) => {
          const hasQuarter = s.history.length > 0;
          const sold = Math.max(0, Math.round(s.last.revenue / Math.max(0.01, s.last.sellPrice)));
          const outputLine = hasQuarter
            ? `Quý vừa rồi xưởng sản xuất ${Math.round(s.last.output).toLocaleString("vi-VN")}, bán khoảng ${sold.toLocaleString("vi-VN")}, còn ${Math.round(s.inventory).toLocaleString("vi-VN")} trong kho.`
            : "Trước khi quý đầu hoàn tất, sản lượng thực tế chưa xuất hiện — chỉ có dự kiến.";
          return `${outputLine} Giá bán dự kiến $${s.sellPrice.toFixed(1)}/đv chịu ảnh hưởng của giá trị xã hội, cung–cầu và cạnh tranh. Thị phần ${(s.marketShare * 100).toFixed(0)}% giúp tiếp cận nhiều cầu hơn, nhưng mở rộng quá nhanh vẫn có thể làm tồn kho tăng. Chuỗi cần nhớ: thị phần → tiếp cận cầu → sản xuất tạo hàng → thị trường quyết định bao nhiêu hàng bán được.`;
        },
        placement: "bottom",
        learnMoreAnchor: "thi-truong",
      },
      {
        target: "contradiction",
        title: "Áp lực xã hội",
        body: (s: GameState) => {
          const v = Math.round(s.contradiction);
          return `Áp lực xã hội tổng hợp sức khỏe, bất ổn, giờ làm, tiền lương, thất nghiệp và các xung đột đang diễn ra — không chỉ cộng thêm chỉ số bất ổn. Hiện ${v}/100 (${contradictionBand(v)}). Các dải: 0–29 Yên · 30–49 Căng nhẹ · 50–69 Bất ổn · 70–84 Nguy hiểm · 85–100 Đứt gãy. Càng gần 100, xưởng càng dễ gặp đình công, bạo loạn hoặc một kết cục xã hội nghiêm trọng.`;
        },
        placement: "left",
        learnMoreAnchor: "ap-luc-xa-hoi",
      },
      {
        target: "historical-scale",
        title: "Cán cân lịch sử",
        body: (s: GameState) => {
          const r = readScale(s);
          const parts = `Tư bản ${Math.round(r.capital)} · Lao động ${Math.round(r.labor)} · Thị trường ${Math.round(r.market)}`;
          const dom = axisDominant(r);
          return `Cán cân đo ba nguồn sức ép đang định hình lịch sử của xưởng, không phải bảng điểm thắng/thua. Tư bản: sức ép từ tích lũy, máy móc, dư nợ. Lao động: sức ép từ giờ làm, lương, sức khỏe, bất ổn. Thị trường: sức ép từ tồn kho, cạnh tranh, khả năng bán hàng. Hiện tại ${parts} — sức ép ${dom} đang nổi bật hơn. Trạng thái "${r.phaseLabel}" chỉ nghĩa là chưa có sức ép nào đủ lớn để chi phối toàn bộ.`;
        },
        placement: "right",
        learnMoreAnchor: "can-can-lich-su",
      },
    ],
  },
  {
    id: "decisions",
    advance: { kind: "manual" },
    openGroup: "WORKDAY",
    pages: [
      {
        target: "decision-tabs",
        title: "Ba quyết định mỗi quý",
        body: "Mỗi quý bạn chỉ được dùng tối đa 3 nhóm quyết định, mỗi nhóm chỉ một lần. Sáu nhóm: Ngày lao động, Tiền lương, Nhân sự, Máy móc, Tích lũy, Tín dụng. Chọn điều quan trọng nhất thay vì cố điều chỉnh mọi thứ.",
        placement: "left",
      },
    ],
  },
  {
    id: "preview",
    advance: { kind: "manual" },
    openGroup: "WAGES",
    pages: [
      {
        target: "decision-panel",
        title: "Xem preview trước khi quyết định",
        body: 'Mỗi lựa chọn hợp lệ hiển thị phần "Nếu áp dụng quyết định này" ngay bên dưới. Màu xanh là chỉ số được cải thiện, màu đỏ là cái giá phải trả, dấu ≈ nghĩa là tác động gần như không đổi. Lưu ý: khi bạn click vào một lựa chọn, quyết định sẽ áp dụng ngay lập tức.',
        placement: "left",
      },
    ],
  },
  {
    id: "apply",
    advance: { kind: "decision-applied" },
    openGroup: "WAGES",
    pages: [
      {
        target: "decision-panel",
        title: "Ra quyết định đầu tiên",
        body: 'Hãy chọn một quyết định an toàn — ví dụ "Tăng lương 10%" để cải thiện sức khỏe và tinh thần công nhân. Tutorial sẽ tiếp tục sau khi bạn áp dụng bất kỳ quyết định hợp lệ nào.',
        placement: "left",
      },
    ],
  },
  {
    id: "end-quarter",
    advance: { kind: "quarter-ended" },
    pages: [
      {
        target: "end-quarter",
        title: "Kết thúc quý",
        body: 'Quyết định chỉ thay đổi điều kiện vận hành. Kết quả thật chỉ xuất hiện khi quý kết thúc — xưởng sẽ sản xuất, bán hàng, trả lương, trả lãi và cập nhật tình hình xã hội. Bạn có thể dùng thêm quyết định hoặc bấm "Kết thúc quý" ngay bây giờ.',
        placement: "left",
      },
    ],
  },
  {
    id: "summary",
    advance: { kind: "manual" },
    pages: [
      {
        target: "log-panel",
        title: "Đọc kết quả quý",
        body: "Giá trị được tạo ra trong sản xuất, nhưng lợi nhuận chỉ được thực hiện khi hàng hóa bán được. Xưởng có thể tạo ra phần dôi ra mà vẫn lỗ hoặc thiếu tiền mặt nếu hàng không bán được, tồn kho cao hoặc chi phí tín dụng lớn.",
        placement: "top",
      },
      {
        target: "cvm-chart",
        title: "Cơ cấu giá trị sản phẩm",
        body: (s: GameState) => {
          const total = Math.max(1, s.last.commodityValue);
          const c = Math.round((s.last.cTransferred / total) * 100);
          const v = Math.round((s.last.reproducedVariableCapital / total) * 100);
          const m = Math.round((s.last.m / total) * 100);
          return `Quý vừa rồi giá trị sản phẩm chia theo cơ cấu c ${c}% · v ${v}% · m ${m}%. c là giá trị tư liệu chuyển vào hàng hóa (không phải toàn bộ tiền mặt đã chi). v là phần ứng ra để mua sức lao động. m là phần giá trị mới do lao động tạo ra vượt quá v — không đồng nhất với lợi nhuận kế toán. Đây là cơ cấu giá trị của quý, không phải tỷ suất lợi nhuận.`;
        },
        showIf: (s: GameState) => s.history.length > 0 && s.last.commodityValue > 0,
        placement: "bottom",
        learnMoreAnchor: "cau-thanh-gia-tri",
      },
      {
        target: "profit-chart",
        title: "Xu hướng hiệu suất vốn",
        body: (s: GameState) => {
          const rate = (s.last.profitRate * 100).toFixed(1);
          return `Biểu đồ theo dõi lợi nhuận kế toán so với vốn xưởng đã ứng cho từng quý. Quý vừa rồi hiệu suất vốn là ${rate}%. Đường đi lên cho thấy vốn đang sinh lợi tốt hơn; đường đi xuống có thể do chi phí tăng, hàng không bán được, lãi vay hoặc vốn máy tăng nhanh hơn lợi nhuận. Đây là tỷ suất từng quý, không phải cả năm — cần thêm các quý sau mới biết đây là xu hướng tăng hay giảm.`;
        },
        showIf: (s: GameState) => s.history.length > 0,
        placement: "bottom",
        learnMoreAnchor: "hieu-suat-von",
      },
    ],
  },
];

/** Return pages in a step filtered by their showIf predicate against live state. */
export function visiblePages(step: TutorialStep, state: GameState) {
  return step.pages.filter((p) => !p.showIf || p.showIf(state));
}

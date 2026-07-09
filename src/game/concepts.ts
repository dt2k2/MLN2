import type { GameState } from "./types";

export type ConceptKey = "c" | "v" | "m" | "pRate" | "contradiction";

export interface ConceptInfo {
  key: ConceptKey;
  title: string;
  short: string;
  formula: string;
  definition: string;
  quote: string;
  context: (s: GameState) => string;
}

export const CONCEPT_INFO: Record<ConceptKey, ConceptInfo> = {
  c: {
    key: "c",
    title: "Tư bản bất biến",
    short: "c",
    formula: "c = khấu hao máy + nguyên liệu",
    definition:
      "Phần tư bản đầu tư vào tư liệu sản xuất (máy móc, nguyên liệu, nhà xưởng). Nó chỉ chuyển giá trị cũ của mình vào sản phẩm mới, không tạo ra một xu giá trị mới nào.",
    quote:
      "«Tư bản bất biến, dù có tăng lên bao nhiêu, cũng không đẻ ra được một chút giá trị thặng dư nào.» — K. Marx",
    context: (s) =>
      `c hiện tại ≈ $${Math.round(s.last.c).toLocaleString("vi-VN")}. Bạn đang vận hành ${s.machines} máy — mỗi quý khấu hao 5% giá máy.`,
  },
  v: {
    key: "v",
    title: "Tư bản khả biến",
    short: "v",
    formula: "v = số công nhân × lương/quý",
    definition:
      "Phần tư bản dùng để mua sức lao động. Duy nhất phần này tạo ra giá trị mới, trong đó có cả giá trị thặng dư mà nhà tư bản chiếm không.",
    quote:
      "«Chỉ có lao động sống mới tạo ra giá trị mới.» — Tư bản, Quyển I",
    context: (s) =>
      `v hiện tại ≈ $${Math.round(s.last.v).toLocaleString("vi-VN")} cho ${s.workersActive} công nhân, lương $${s.wagePerWorker}/quý.`,
  },
  m: {
    key: "m",
    title: "Giá trị thặng dư",
    short: "m",
    formula: "m = V′ − v ; m′ = m / v",
    definition:
      "Phần giá trị do lao động sống tạo ra vượt quá giá trị sức lao động (v). Đây là mục tiêu tối thượng của nền sản xuất tư bản chủ nghĩa, là nguồn gốc mọi lợi nhuận.",
    quote:
      "«Bí mật của việc sản xuất giá trị thặng dư nằm ở lao động không công.» — K. Marx",
    context: (s) => {
      const rate = (s.last.exploitation * 100).toFixed(0);
      return `m′ = ${rate}% — mỗi $1 trả lương, công nhân tạo ra thêm $${(s.last.exploitation).toFixed(2)} giá trị cho bạn.`;
    },
  },
  pRate: {
    key: "pRate",
    title: "Tỷ suất lợi nhuận",
    short: "p′",
    formula: "p′ = m / (c + v)",
    definition:
      "Tỷ lệ giữa giá trị thặng dư và toàn bộ tư bản ứng trước. Khi cấu tạo hữu cơ c/v tăng (đầu tư máy nhiều hơn người), p′ có xu hướng giảm — quy luật lịch sử của phương thức sản xuất tư bản.",
    quote:
      "«Sự giảm sút của tỷ suất lợi nhuận là biểu hiện đặc thù của phương thức sản xuất tư bản chủ nghĩa.» — Tư bản, Quyển III",
    context: (s) => {
      const p = (s.last.profitRate * 100).toFixed(1);
      const cv = s.last.organic.toFixed(2);
      return `p′ = ${p}% với c/v = ${cv}. ${s.last.organic > 2 ? "Cấu tạo hữu cơ cao — p′ đang bị nén xuống." : "Còn dư địa tích lũy, nhưng chú ý khi c/v vượt 2."}`;
    },
  },
  contradiction: {
    key: "contradiction",
    title: "Mâu thuẫn giai cấp",
    short: "K",
    formula: "K ← K + unrest × 0.015 (không thể đảo ngược dễ dàng)",
    definition:
      "Chỉ số tích lũy dài hạn phản ánh xung đột giữa lực lượng sản xuất xã hội hóa và quan hệ chiếm hữu tư nhân. Đến ngưỡng 100 sẽ nổ ra cách mạng — kết thúc phương thức sản xuất tư bản.",
    quote:
      "«Giai cấp tư sản, trước hết, sản sinh ra những người đào huyệt chôn chính nó.» — Tuyên ngôn của Đảng Cộng sản",
    context: (s) => {
      const c = Math.round(s.contradiction);
      if (c >= 75) return `${c}/100 — Nguy cấp! Xã hội đang trên bờ vực nổi dậy.`;
      if (c >= 60) return `${c}/100 — Bất ổn nghiêm trọng, cần nhượng bộ.`;
      return `${c}/100 — Xã hội còn chịu đựng được, nhưng đang tích lũy.`;
    },
  },
};

/**
 * Điều kiện Eureka — mở khoá khái niệm sau 1 quý.
 * Trả về concept key nếu vừa đạt.
 */
export function checkEureka(prev: GameState, next: GameState): ConceptKey | null {
  if (prev.last.exploitation < 2 && next.last.exploitation >= 2) return "m";
  if (prev.last.organic < 2 && next.last.organic >= 2) return "pRate";
  if (prev.contradiction < 50 && next.contradiction >= 50) return "contradiction";
  if (prev.last.c < 10000 && next.last.c >= 10000) return "c";
  if (prev.last.v < 8000 && next.last.v >= 8000) return "v";
  return null;
}

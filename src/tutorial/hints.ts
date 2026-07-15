import type { GameState } from "@/game/types";
import type { ContextualHint, ContextualHintId } from "./types";

export const CONTEXTUAL_HINTS: Record<ContextualHintId, ContextualHint> = {
  "low-cash": {
    id: "low-cash",
    target: "header-cash",
    title: "Tiền mặt xuống thấp",
    body: "Vay có thể cứu thanh khoản ngay, nhưng nợ sẽ tăng và lãi quý sau sẽ nặng hơn. Cân nhắc giảm chi phí hoặc bán bớt tồn kho trước khi vay.",
  },
  "high-inventory": {
    id: "high-inventory",
    target: "dashboard-grid",
    title: "Tồn kho đang cao",
    body: "Sản xuất nhiều không bảo đảm bán được. Cầu hiệu dụng của thị trường mới quyết định doanh thu — cần phân biệt sản lượng và cầu.",
  },
  "low-health": {
    id: "low-health",
    target: "dashboard-grid",
    title: "Công nhân đang kiệt sức",
    body: "Giờ làm dài, lương thấp hoặc sa thải nhiều sẽ đẩy sức khỏe và tinh thần đi xuống, kéo theo áp lực xã hội và bất ổn.",
  },
  "bought-machine": {
    id: "bought-machine",
    target: "dashboard-grid",
    title: "Bạn vừa mua máy",
    body: "Máy tăng năng suất và chuyển giá trị cũ (khấu hao) vào hàng hóa, nhưng bản thân máy không tự tạo ra giá trị mới — chỉ lao động sống mới làm điều đó.",
  },
  "first-profit": {
    id: "first-profit",
    target: "header-cash",
    title: "Lần đầu có lợi nhuận",
    body: "Lợi nhuận giữ lại được đưa vào quỹ tích lũy theo tỷ lệ ở nhóm Tích lũy. Phần còn lại là tiêu dùng của chủ.",
  },
  "first-borrow": {
    id: "first-borrow",
    target: "header-cash",
    title: "Lần đầu vay tín dụng",
    body: "Tiền vay làm tăng tiền mặt và dư nợ cùng lúc — không phải doanh thu, không phải lợi nhuận. Bạn sẽ trả lãi mỗi quý tới khi tất toán.",
  },
  "first-event": {
    id: "first-event",
    target: "log-panel",
    title: "Sự kiện đầu tiên",
    body: "Sự kiện là tình huống bắt buộc. Mỗi lựa chọn có điều kiện áp dụng và hậu quả có thể kéo dài nhiều quý.",
  },
};

export interface HintTriggerContext {
  prev: GameState | null;
  next: GameState;
}

export function detectHint(ctx: HintTriggerContext): ContextualHintId | null {
  const { prev, next } = ctx;
  if (!prev) return null;

  if (prev.cash >= 8000 && next.cash < 8000) return "low-cash";
  if (
    prev.inventory <= next.demand * 0.9 &&
    next.inventory > next.demand * 1.4 &&
    next.inventory > 300
  ) {
    return "high-inventory";
  }
  if (prev.health >= 50 && next.health < 50) return "low-health";
  if (next.machines > prev.machines) return "bought-machine";
  if (
    prev.history.length > 0 &&
    next.history.length > prev.history.length &&
    prev.history.every((r) => r.accountingProfit <= 0) &&
    (next.last.accountingProfit ?? 0) > 0
  ) {
    return "first-profit";
  }
  if (next.debt > prev.debt + 100) return "first-borrow";
  if (!prev.pendingEvent && next.pendingEvent) return "first-event";
  return null;
}

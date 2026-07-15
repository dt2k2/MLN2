import type { GameState } from "@/game/types";
import { readScale } from "@/game/pressures";
import type { ContextualHint, ContextualHintId } from "./types";

export const CONTEXTUAL_HINTS: Record<ContextualHintId, ContextualHint> = {
  "low-cash": {
    id: "low-cash",
    target: "header-cash",
    title: "Tiền mặt xuống thấp",
    body: "Vay có thể cứu thanh khoản ngay, nhưng nợ sẽ tăng và lãi quý sau nặng hơn. Cân nhắc giảm chi phí hoặc bán bớt tồn kho trước khi vay.",
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
  "scale-multi-high": {
    id: "scale-multi-high",
    target: "historical-scale",
    title: "Nhiều sức ép cộng hưởng",
    body: "Từ hai trục cán cân trở lên đang ở mức cao đồng thời. Một giải pháp đơn lẻ khó ổn định xưởng — cần đánh đổi giữa tài chính, lao động và thị trường.",
  },
  "scale-capital-high": {
    id: "scale-capital-high",
    target: "historical-scale-capital",
    title: "Sức ép tài chính nổi lên",
    body: "Xưởng đang bị dẫn dắt bởi tích lũy, máy móc và dư nợ. Đây là sức ép chứ không phải sức mạnh: khi lợi nhuận giảm, gánh nặng vốn sẽ đè lên dòng tiền.",
  },
  "scale-labor-high": {
    id: "scale-labor-high",
    target: "historical-scale-labor",
    title: "Quan hệ lao động thành mâu thuẫn trung tâm",
    body: "Giờ làm, lương, sức khỏe và bất ổn đang cộng dồn. Nếu tiếp tục vắt kiệt, xưởng có nguy cơ đình công, kiệt sức hoặc bạo loạn.",
  },
  "scale-market-high": {
    id: "scale-market-high",
    target: "historical-scale-market",
    title: "Thị trường quyết định vận động của xưởng",
    body: "Tồn kho, cạnh tranh và khả năng bán hàng đang chi phối kết quả. Tăng sản lượng lúc này dễ đẩy hàng nằm kho.",
  },
};

export interface HintTriggerContext {
  prev: GameState | null;
  next: GameState;
}

const SCALE_HIGH = 60;
const SCALE_MULTI = 55;

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

  // Cán cân lịch sử — kiểm tra multi trước để không bị hint đơn lẻ chiếm chỗ.
  const prevScale = readScale(prev);
  const nextScale = readScale(next);
  const prevCount = [prevScale.capital, prevScale.labor, prevScale.market].filter(
    (v) => v > SCALE_MULTI,
  ).length;
  const nextCount = [nextScale.capital, nextScale.labor, nextScale.market].filter(
    (v) => v > SCALE_MULTI,
  ).length;
  if (prevCount < 2 && nextCount >= 2) return "scale-multi-high";
  if (prevScale.capital <= SCALE_HIGH && nextScale.capital > SCALE_HIGH) return "scale-capital-high";
  if (prevScale.labor <= SCALE_HIGH && nextScale.labor > SCALE_HIGH) return "scale-labor-high";
  if (prevScale.market <= SCALE_HIGH && nextScale.market > SCALE_HIGH) return "scale-market-high";
  return null;
}

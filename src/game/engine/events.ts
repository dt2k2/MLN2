import type { GameState, EventOccurrence } from "../types";
import type { Rng } from "./rng";

interface EventDef {
  id: string;
  weight: (s: GameState) => number;
  build: (s: GameState) => EventOccurrence;
}

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

const EVENTS: EventDef[] = [
  {
    id: "strike",
    weight: (s) => Math.max(0, (s.unrest - 30) / 100) + (s.workHours > 12 ? 0.15 : 0),
    build: () => ({
      id: "strike",
      title: "Công nhân đình công",
      description:
        "Sau nhiều quý làm việc quá sức, công nhân xưởng dệt bãi công đòi giảm giờ làm và tăng lương.",
      choices: [
        {
          label: "Nhượng bộ — tăng lương 10%",
          tone: "accept",
          previewLabel: "v ↑10% · Unrest −20 · Mâu thuẫn −2",
          apply: (s) => {
            s.wagePerWorker = Math.round(s.wagePerWorker * 1.1);
            s.unrest = clamp(s.unrest - 20);
            s.contradiction = clamp(s.contradiction - 2);
          },
        },
        {
          label: "Đàn áp — gọi cảnh sát",
          tone: "refuse",
          previewLabel: "Sản xuất −25% quý này · Unrest +10 · Mâu thuẫn +8",
          apply: (s) => {
            s.inventory = Math.floor(s.inventory * 0.75);
            s.unrest = clamp(s.unrest + 10);
            s.contradiction = clamp(s.contradiction + 8);
          },
        },
      ],
    }),
  },
  {
    id: "cotton-shock",
    weight: () => 0.08,
    build: () => ({
      id: "cotton-shock",
      title: "Khủng hoảng bông thô thuộc địa",
      description: "Chiến sự ở thuộc địa khiến giá bông tăng vọt trong hai quý tới.",
      choices: [
        {
          label: "Tích trữ ngay — chi $6.000",
          tone: "accept",
          previewLabel: "−$6.000 · giữ giá nguyên liệu",
          apply: (s) => {
            s.cash -= 6000;
          },
        },
        {
          label: "Chấp nhận rủi ro",
          tone: "refuse",
          previewLabel: "Giá nguyên liệu +40%",
          apply: (s) => {
            s.materialPrice *= 1.4;
          },
        },
      ],
    }),
  },
  {
    id: "invention",
    weight: (s) => 0.05 + Math.min(0.1, s.machines * 0.01),
    build: () => ({
      id: "invention",
      title: "Phát minh máy dệt mới",
      description: "Một kỹ sư chào bán máy dệt hơi nước cải tiến, đắt nhưng năng suất gấp đôi.",
      choices: [
        {
          label: "Mua bản quyền — $12.000",
          tone: "accept",
          previewLabel: "+1 máy siêu năng suất · −$12.000",
          apply: (s) => {
            s.cash -= 12000;
            s.machines += 2;
          },
        },
        {
          label: "Từ chối",
          tone: "refuse",
          previewLabel: "Không đổi",
          apply: () => {},
        },
      ],
    }),
  },
  {
    id: "factory-act",
    weight: (s) => (s.contradiction > 40 ? 0.25 : 0.02),
    build: () => ({
      id: "factory-act",
      title: "Nghị viện đề xuất Luật Xưởng máy",
      description:
        "Áp lực xã hội buộc nghị viện xem xét luật giới hạn giờ làm việc xuống 10 giờ.",
      choices: [
        {
          label: "Ủng hộ cải cách",
          tone: "accept",
          previewLabel: "Giờ làm cap 10 · Mâu thuẫn −10 · Sức khoẻ +8",
          apply: (s) => {
            s.workHours = Math.min(s.workHours, 10);
            s.contradiction = clamp(s.contradiction - 10);
            s.health = clamp(s.health + 8);
          },
        },
        {
          label: "Vận động chống lại",
          tone: "refuse",
          previewLabel: "−$4.000 hối lộ · Mâu thuẫn +6",
          apply: (s) => {
            s.cash -= 4000;
            s.contradiction = clamp(s.contradiction + 6);
          },
        },
      ],
    }),
  },
  {
    id: "cholera",
    weight: (s) => 0.04 + (s.health < 50 ? 0.1 : 0),
    build: () => ({
      id: "cholera",
      title: "Dịch tả bùng phát ở khu công nhân",
      description: "Điều kiện sống tồi tệ khiến dịch bệnh lan rộng.",
      choices: [
        {
          label: "Chi $3.000 chăm sóc y tế",
          tone: "accept",
          previewLabel: "−$3.000 · Sức khoẻ +12",
          apply: (s) => {
            s.cash -= 3000;
            s.health = clamp(s.health + 12);
          },
        },
        {
          label: "Mặc kệ",
          tone: "refuse",
          previewLabel: "Mất 8 công nhân · Unrest +15",
          apply: (s) => {
            s.workersActive = Math.max(0, s.workersActive - 8);
            s.unrest = clamp(s.unrest + 15);
          },
        },
      ],
    }),
  },
  {
    id: "credit-crunch",
    weight: (s) => (s.debt > 20000 ? 0.15 : 0.02),
    build: () => ({
      id: "credit-crunch",
      title: "Khủng hoảng tín dụng",
      description: "Ngân hàng siết nợ, đòi trả trước hạn một phần.",
      choices: [
        {
          label: "Trả $8.000",
          tone: "accept",
          previewLabel: "−$8.000 tiền mặt · Nợ −$8.000",
          apply: (s) => {
            s.cash -= 8000;
            s.debt = Math.max(0, s.debt - 8000);
          },
        },
        {
          label: "Đàm phán gia hạn",
          tone: "refuse",
          previewLabel: "Nợ +$2.000 lãi phạt",
          apply: (s) => {
            s.debt += 2000;
          },
        },
      ],
    }),
  },
  {
    id: "union",
    weight: (s) => (s.unrest > 50 ? 0.2 : 0.03),
    build: () => ({
      id: "union",
      title: "Công đoàn thành lập trong nhà máy",
      description: "Công nhân tự tổ chức. Bạn không thể ngăn, chỉ có thể chọn thái độ.",
      choices: [
        {
          label: "Thương lượng",
          tone: "accept",
          previewLabel: "Mâu thuẫn −6 · v tăng nhẹ",
          apply: (s) => {
            s.wagePerWorker = Math.round(s.wagePerWorker * 1.05);
            s.contradiction = clamp(s.contradiction - 6);
          },
        },
        {
          label: "Sa thải người cầm đầu",
          tone: "refuse",
          previewLabel: "Unrest +25 · Mâu thuẫn +10",
          apply: (s) => {
            s.unrest = clamp(s.unrest + 25);
            s.contradiction = clamp(s.contradiction + 10);
          },
        },
      ],
    }),
  },
];

export function rollEvent(s: GameState, rng: Rng): EventOccurrence | null {
  const weights = EVENTS.map((e) => ({ e, w: Math.max(0, e.weight(s)) }));
  const total = weights.reduce((a, b) => a + b.w, 0);
  // Xác suất có sự kiện = min(0.85, total)
  const eventChance = Math.min(0.85, total);
  if (rng() > eventChance) return null;
  const pick = rng() * total;
  let acc = 0;
  for (const { e, w } of weights) {
    acc += w;
    if (pick <= acc) return e.build(s);
  }
  return null;
}

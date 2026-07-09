export type ActionId =
  | "EXTEND_HOURS"
  | "RAISE_WAGE"
  | "BUY_MACHINE"
  | "EXPAND_FACTORY"
  | "LAYOFF"
  | "BORROW";

export type EndingId = "revolution" | "bankruptcy" | "monopoly" | "reform" | "timeout";

export interface QuarterRecord {
  turn: number;
  year: number;
  quarter: number;
  c: number;
  v: number;
  m: number;
  W: number;
  profit: number;
  profitRate: number;      // p′ = m/(c+v)
  profitRateReal: number;  // profit / (c+v)
  exploitation: number;    // m′
  organic: number;         // c/v
  contradiction: number;
  unrest: number;
  health: number;
  output: number;
  demand: number;
  inventory: number;
  sellPrice: number;
  materialPrice: number;
}

export interface EventOccurrence {
  id: string;
  title: string;
  description: string;
  choices: {
    label: string;
    tone: "accept" | "refuse";
    apply: (s: GameState) => void; // mutates via immer draft
    previewLabel: string;
  }[];
}

export interface LogEntry {
  turn: number;
  type: "event" | "decision" | "concept" | "system";
  text: string;
}

export interface GameState {
  seed: number;
  turn: number;
  year: number;
  quarter: number;

  companyName: string;

  // Tư bản
  cash: number;
  debt: number;
  machines: number;
  inventory: number;

  // Lao động
  workersActive: number;
  workersIdle: number;
  wagePerWorker: number;
  workHours: number;

  // Xã hội
  health: number;         // 0–100
  unrest: number;         // 0–100
  contradiction: number;  // 0–100 (chậm)

  // Chỉ số quý gần nhất (để hiển thị)
  last: QuarterRecord;

  // Thị trường
  sellPrice: number;
  materialPrice: number;
  demand: number;
  industryProductivity: number; // 1.0 chuẩn hoá
  marketShare: number;          // 0–1
  overstockStreak: number;
  debtStressStreak: number;
  riotStreak: number;

  history: QuarterRecord[];
  log: LogEntry[];

  // Trạng thái luồng
  pendingEvent: EventOccurrence | null;
  ending: EndingId | null;
}

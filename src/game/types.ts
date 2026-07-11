export type ActionId =
  "EXTEND_HOURS" | "RAISE_WAGE" | "BUY_MACHINE" | "EXPAND_FACTORY" | "LAYOFF" | "BORROW";

export type ConceptKey =
  | "commodity"
  | "socialLabor"
  | "constantCapital"
  | "variableCapital"
  | "surplusValue"
  | "absoluteSurplus"
  | "relativeSurplus"
  | "surplusRate"
  | "capitalAccumulation"
  | "organicComposition"
  | "reserveArmy"
  | "profitRate"
  | "overproductionCrisis"
  | "capitalistContradiction"
  | "fallingProfitRate";

export type AchievementId = "surplus-rate" | "organic-composition" | "reserve-army";

export interface ConceptDiscovery {
  key: ConceptKey;
  turn: number;
  quarter: number;
  year: number;
  action: string;
  consequence: string;
}

export type DiscoveryState = Partial<Record<ConceptKey, ConceptDiscovery>>;
export type AchievementState = Partial<Record<AchievementId, true>>;

export type PresentationItem =
  | { id: string; kind: "eureka"; conceptKey: ConceptKey }
  | {
      id: string;
      kind: "achievement";
      achievementId: AchievementId;
      conceptKey: ConceptKey;
    }
  | { id: string; kind: "summary"; completedTurn: number }
  | {
      id: string;
      kind: "eraRecap";
      startTurn: number;
      endTurn: number;
      conceptKeys: ConceptKey[];
    };

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
  profitRate: number; // p′ = m/(c+v)
  profitRateReal: number; // profit / (c+v)
  exploitation: number; // m′
  organic: number; // c/v
  contradiction: number;
  unrest: number;
  health: number;
  output: number;
  demand: number;
  inventory: number;
  sellPrice: number;
  materialPrice: number;
  laborProductivity: number; // units produced per labor hour
  individualLaborTime: number; // labor hours per unit in this factory
  socialLaborTime: number; // socially necessary labor hours per unit
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
  health: number; // 0–100
  unrest: number; // 0–100
  contradiction: number; // 0–100 (chậm)

  // Chỉ số quý gần nhất (để hiển thị)
  last: QuarterRecord;

  // Thị trường
  sellPrice: number;
  materialPrice: number;
  demand: number;
  industryProductivity: number; // 1.0 chuẩn hoá
  marketShare: number; // 0–1
  overstockStreak: number;
  debtStressStreak: number;
  riotStreak: number;

  history: QuarterRecord[];
  log: LogEntry[];

  discoveredConcepts: DiscoveryState;
  achievements: AchievementState;

  // Trạng thái luồng
  pendingEvent: EventOccurrence | null;
  ending: EndingId | null;
}

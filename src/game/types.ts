export type DecisionGroupId =
  "WORKDAY" | "WAGES" | "STAFFING" | "MACHINERY" | "ACCUMULATION" | "CREDIT";

export type DecisionOptionId =
  | "EXTEND_HOURS"
  | "REDUCE_HOURS"
  | "RAISE_WAGE"
  | "CUT_WAGE"
  | "HIRE_WORKERS"
  | "LAYOFF"
  | "BUY_MACHINE"
  | "SELL_MACHINE"
  | "REINVEST_25"
  | "REINVEST_50"
  | "REINVEST_75"
  | "REINVEST_100"
  | "BORROW"
  | "REPAY_5000"
  | "REPAY_15000"
  | "REPAY_ALL";

export type GamePhase = 1 | 2 | 3 | 4;

export type OwnerStance = "pragmatic" | "reformist" | "coercive" | "speculative" | "expansionist";

export interface OwnerSignal {
  turn: number;
  stance: OwnerStance;
  source: string;
}

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

export interface StoryPresentation {
  id: string;
  kind: "chapter" | "beat";
  eyebrow: string;
  title: string;
  body: string;
}

export type PresentationItem =
  | {
      id: string;
      kind: "eureka";
      conceptKey: ConceptKey;
      series?: { id: string; step: number; total: number };
    }
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
    }
  | { id: string; kind: "event"; eventId: string }
  | { id: string; kind: "story"; story: StoryPresentation };

export type EndingId = "revolution" | "bankruptcy" | "monopoly" | "reform" | "timeout";

export type TimedEffectKind =
  | "outputMultiplier"
  | "demandMultiplier"
  | "materialPriceMultiplier"
  | "interestRateMultiplier"
  | "workHoursCap";

export interface TimedEffect {
  id: string;
  source: string;
  kind: TimedEffectKind;
  value: number;
  remainingTurns: number;
}

export interface CompetitorSnapshot {
  id: "bauer" | "schmidt" | "krupp";
  name: string;
  archetype: string;
  techLevel: number;
  unitLaborTime: number;
  scale: number;
  output: number;
  priceIndex: number;
  marketShare: number;
}

export interface EventHistoryEntry {
  count: number;
  lastTurn: number;
}

export interface QuarterRecord {
  turn: number;
  year: number;
  quarter: number;
  cTransferred: number;
  v: number;
  m: number;
  newValue: number;
  effectiveLaborHours: number;
  validatedLaborHours: number;
  necessaryLaborTime: number;
  surplusLaborTime: number;
  extraProfit: number;
  commodityValue: number;
  revenue: number;
  materialCost: number;
  depreciation: number;
  machineBookValue: number;
  constantCapitalAdvanced: number;
  totalCapitalAdvanced: number;
  operatingCashFlow: number;
  accountingProfit: number;
  retainedProfit: number;
  ownerConsumption: number;
  interestPaid: number;
  debtRatio: number;
  profitRate: number;
  profitRateReal: number;
  exploitation: number;
  organic: number;
  contradiction: number;
  unrest: number;
  health: number;
  output: number;
  demand: number;
  effectiveDemand: number;
  industrySupply: number;
  inventory: number;
  sellPrice: number;
  materialPrice: number;
  laborProductivity: number;
  individualLaborTime: number;
  socialLaborTime: number;
  machines: number;
  machinesAtTurnStart: number;
  workHoursAtTurnStart: number;
  laborProductivityAtTurnStart: number;
  capitalizedAccumulation: number;
}

export interface EventChoice {
  label: string;
  tone: "accept" | "refuse";
  apply: (s: GameState) => void;
  previewLabel: string;
  canChoose?: (s: GameState) => boolean;
  disabledReason?: string;
  ownerStance?: OwnerStance;
}

export interface EventOccurrence {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface LogEntry {
  turn: number;
  type: "event" | "decision" | "concept" | "system" | "news";
  text: string;
}

export interface GameState {
  seed: number;
  turn: number;
  year: number;
  quarter: number;
  companyName: string;
  protagonistName: string;

  cash: number;
  debt: number;
  ownerConsumption: number;
  reinvestmentRate: number;
  accumulationFund: number;
  capitalizedAccumulationThisTurn: number;
  machines: number;
  machineBookValue: number;
  machinesAtTurnStart: number;
  inventory: number;

  workersActive: number;
  workersIdle: number;
  wagePerWorker: number;
  workHours: number;
  workHoursAtTurnStart: number;
  laborProductivityAtTurnStart: number;
  legalMaxWorkHours: number;

  health: number;
  unrest: number;
  contradiction: number;
  socialUnemployment: number;
  purchasingPowerIndex: number;

  last: QuarterRecord;

  sellPrice: number;
  materialPrice: number;
  demand: number;
  effectiveDemand: number;
  industrySupply: number;
  industryProductivity: number;
  marketShare: number;
  competitors: CompetitorSnapshot[];
  overstockStreak: number;
  debtStressStreak: number;
  riotStreak: number;

  activeEffects: TimedEffect[];
  eventHistory: Record<string, EventHistoryEntry>;
  seenStoryIds: Record<string, true>;
  ownerSignals: OwnerSignal[];

  history: QuarterRecord[];
  log: LogEntry[];
  discoveredConcepts: DiscoveryState;
  achievements: AchievementState;

  pendingEvent: EventOccurrence | null;
  ending: EndingId | null;
}

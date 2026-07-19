import { create } from "zustand";
import { produce } from "immer";
import { BAL } from "./balance";
import { CONCEPT_INFO, checkImmediateDiscoveries, checkQuarterDiscoveries } from "./concepts";
import { DECISIONS, decisionGroupTitle } from "./decisions";
import { createInitialCompetitors } from "./engine/competitors";
import { checkEnding } from "./engine/endings";
import { advanceQuarter } from "./engine/tick";
import { collectStories } from "./story";
import { clearEndingReportSnapshot } from "./ending-report";
import type {
  AchievementId,
  ConceptDiscovery,
  ConceptKey,
  DecisionGroupId,
  DecisionOptionId,
  GameState,
  PresentationItem,
  QuarterRecord,
  StoryPresentation,
} from "./types";

export const MAX_DECISION_GROUPS_PER_TURN = 3;
export const MAX_OWNER_SIGNALS = 4;
export const OWNER_SIGNAL_LIFETIME = 4;

function appendOwnerSignal(
  state: GameState,
  signal: GameState["ownerSignals"][number] | undefined,
) {
  const recent = state.ownerSignals.filter(
    (item) => state.turn - item.turn <= OWNER_SIGNAL_LIFETIME,
  );
  state.ownerSignals = signal
    ? [...recent, signal].slice(-MAX_OWNER_SIGNALS)
    : recent.slice(-MAX_OWNER_SIGNALS);
}

const ACHIEVEMENT_BY_CONCEPT: Partial<Record<ConceptKey, AchievementId>> = {
  surplusRate: "surplus-rate",
  organicComposition: "organic-composition",
  reserveArmy: "reserve-army",
};

function emptyRecord(): QuarterRecord {
  return {
    turn: 0,
    year: BAL.startYear,
    quarter: BAL.startQuarter,
    cTransferred: 0,
    v: 0,
    m: 0,
    newValue: 0,
    reproducedVariableCapital: 0,
    unrecoveredVariableCapital: 0,
    effectiveLaborHours: 0,
    validatedLaborHours: 0,
    necessaryLaborTime: 0,
    surplusLaborTime: 0,
    extraProfit: 0,
    commodityValue: 0,
    revenue: 0,
    materialCost: 0,
    depreciation: 0,
    machineBookValue: BAL.machinePrice * BAL.initialMachines,
    constantCapitalAdvanced: 0,
    totalCapitalAdvanced: 0,
    operatingCashFlow: 0,
    accountingProfit: 0,
    retainedProfit: 0,
    ownerConsumption: 0,
    interestPaid: 0,
    debtRatio: 0,
    profitRate: 0,
    profitRateReal: 0,
    exploitation: 0,
    organic: 0,
    contradiction: 20,
    unrest: 15,
    health: 80,
    output: 0,
    demand: 1_050,
    effectiveDemand: BAL.baseIndustryDemand,
    industrySupply: 3_750,
    inventory: 0,
    sellPrice: BAL.baseSellPrice,
    materialPrice: BAL.baseMaterialPrice,
    laborProductivity: 0.16,
    individualLaborTime: 6.25,
    socialLaborTime: BAL.baseSocialLaborTime,
    machines: BAL.initialMachines,
    machinesAtTurnStart: BAL.initialMachines,
    workHoursAtTurnStart: BAL.baseWorkHours,
    laborProductivityAtTurnStart: 0.16,
    capitalizedAccumulation: 0,
  };
}

export function initialState(seed: number = BAL.initialSeed): GameState {
  return {
    seed,
    turn: 1,
    year: BAL.startYear,
    quarter: BAL.startQuarter,
    companyName: "Müller & Söhne Textilwerk",
    protagonistName: "Heinrich Müller",
    cash: BAL.initialCash,
    debt: BAL.initialDebt,
    ownerConsumption: 0,
    reinvestmentRate: 0.25,
    accumulationFund: 0,
    capitalizedAccumulationThisTurn: 0,
    machines: BAL.initialMachines,
    machineBookValue: BAL.machinePrice * BAL.initialMachines,
    machinesAtTurnStart: BAL.initialMachines,
    inventory: BAL.initialInventory,
    workersActive: BAL.initialActiveWorkers,
    workersIdle: BAL.initialIdleWorkers,
    wagePerWorker: BAL.baseWagePerWorker,
    workHours: BAL.baseWorkHours,
    workHoursAtTurnStart: BAL.baseWorkHours,
    laborProductivityAtTurnStart: 0.16,
    legalMaxWorkHours: BAL.maxWorkHours,
    health: 80,
    unrest: 15,
    contradiction: 20,
    socialUnemployment: 12,
    purchasingPowerIndex: 0.988,
    last: emptyRecord(),
    sellPrice: BAL.baseSellPrice,
    materialPrice: BAL.baseMaterialPrice,
    demand: 1_050,
    effectiveDemand: BAL.baseIndustryDemand,
    industrySupply: 3_750,
    industryProductivity: 1,
    marketShare: 0.25,
    competitors: createInitialCompetitors(),
    overstockStreak: 0,
    debtStressStreak: 0,
    riotStreak: 0,
    activeEffects: [],
    eventHistory: {},
    seenStoryIds: {},
    ownerSignals: [],
    decisionHistory: [],
    history: [],
    log: [
      {
        turn: 1,
        type: "system",
        text: `Di sản của xưởng: dư nợ $${BAL.initialDebt.toLocaleString("vi-VN")}, lãi quý đầu $${(BAL.initialDebt * BAL.quarterlyLoanRate).toLocaleString("vi-VN")}.`,
      },
      {
        turn: 1,
        type: "system",
        text: "Ván chơi bắt đầu — quý I năm 1852.",
      },
    ],
    discoveredConcepts: {},
    achievements: {},
    pendingEvent: null,
    ending: null,
  };
}

function registerDiscoveries(
  state: GameState,
  discoveries: ConceptDiscovery[],
): { state: GameState; presentations: PresentationItem[] } {
  const fresh = discoveries.filter((item) => !state.discoveredConcepts[item.key]);
  if (fresh.length === 0) return { state, presentations: [] };

  const achievements: { id: AchievementId; conceptKey: ConceptKey }[] = [];
  const next = produce(state, (draft) => {
    for (const item of fresh) {
      draft.discoveredConcepts[item.key] = item;
      const achievementId = ACHIEVEMENT_BY_CONCEPT[item.key];
      if (achievementId && !draft.achievements[achievementId]) {
        draft.achievements[achievementId] = true;
        achievements.push({ id: achievementId, conceptKey: item.key });
      }
    }
    for (let index = fresh.length - 1; index >= 0; index -= 1) {
      const item = fresh[index];
      draft.log.unshift({
        turn: item.turn,
        type: "concept",
        text: `Khám phá: ${CONCEPT_INFO[item.key].title}`,
      });
    }
  });

  return {
    state: next,
    presentations: [
      ...fresh.map((item, index): PresentationItem => {
        const firstProduction =
          item.turn === 1 &&
          fresh.length === 3 &&
          fresh.every((entry) =>
            ["commodity", "variableCapital", "surplusValue"].includes(entry.key),
          );
        return {
          id: `eureka-${item.key}-${item.turn}`,
          kind: "eureka",
          conceptKey: item.key,
          series: firstProduction
            ? { id: "first-production", step: index + 1, total: fresh.length }
            : undefined,
        };
      }),
      ...achievements.map((item): PresentationItem => ({
        id: `achievement-${item.id}`,
        kind: "achievement",
        achievementId: item.id,
        conceptKey: item.conceptKey,
      })),
    ],
  };
}

function storyItems(stories: StoryPresentation[]): PresentationItem[] {
  return stories.map((story) => ({
    id: story.id,
    kind: "story",
    story,
  }));
}

function markStories(state: GameState, stories: StoryPresentation[]): GameState {
  if (stories.length === 0) return state;
  return produce(state, (draft) => {
    for (const story of stories) draft.seenStoryIds[story.id] = true;
  });
}

function withOpening(seed?: number) {
  let state = initialState(seed);
  const stories = collectStories(state);
  state = markStories(state, stories);
  return { state, queue: storyItems(stories) };
}

export interface GameStore {
  state: GameState;
  usedDecisionGroups: Set<DecisionGroupId>;
  layoffsThisTurn: number;
  workersAtTurnStart: number;
  presentationQueue: PresentationItem[];
  decisionUndoStack: DecisionUndoSnapshot[];
  applyDecision: (optionId: DecisionOptionId) => void;
  undoLastDecision: () => void;
  endQuarter: () => void;
  resolveEvent: (choiceIndex: number) => void;
  dismissPresentation: () => void;
  showCurrentSummary: () => void;
  reset: () => void;
}

export interface DecisionUndoSnapshot {
  optionId: DecisionOptionId;
  state: GameState;
  usedDecisionGroups: Set<DecisionGroupId>;
  layoffsThisTurn: number;
  workersAtTurnStart: number;
  presentationQueue: PresentationItem[];
}

const opening = withOpening(BAL.initialSeed);

export const useGameStore = create<GameStore>((set, get) => ({
  state: opening.state,
  usedDecisionGroups: new Set(),
  layoffsThisTurn: 0,
  workersAtTurnStart: opening.state.workersActive,
  presentationQueue: opening.queue,
  decisionUndoStack: [],

  applyDecision: (optionId) => {
    const store = get();
    const decision = DECISIONS[optionId];
    if (
      !decision ||
      store.presentationQueue.length > 0 ||
      store.state.pendingEvent ||
      store.state.ending ||
      store.usedDecisionGroups.has(decision.groupId) ||
      store.usedDecisionGroups.size >= MAX_DECISION_GROUPS_PER_TURN ||
      !decision.canApply(store.state)
    ) {
      return;
    }

    const previous = store.state;
    const next = produce(previous, (draft) => {
      decision.apply(draft);
      const stance =
        typeof decision.ownerStance === "function"
          ? decision.ownerStance(previous, draft as GameState)
          : decision.ownerStance;
      appendOwnerSignal(
        draft,
        stance ? { turn: draft.turn, stance, source: `decision:${decision.id}` } : undefined,
      );
      draft.decisionHistory.push({
        turn: draft.turn,
        year: draft.year,
        quarter: draft.quarter,
        source: "decision",
        id: decision.id,
        label: decision.label,
        groupId: decision.groupId,
        ownerStance: stance,
      });
      draft.log.unshift({
        turn: draft.turn,
        type: "decision",
        text: `${decision.label} (${decisionGroupTitle(decision.groupId)})`,
      });
    });
    const layoffs =
      store.layoffsThisTurn + Math.max(0, previous.workersActive - next.workersActive);
    const discoveries = checkImmediateDiscoveries({
      prev: previous,
      next,
      cause: "decision",
      workersAtTurnStart: store.workersAtTurnStart,
      discovered: previous.discoveredConcepts,
    });
    const registered = registerDiscoveries(next, discoveries);
    const usedDecisionGroups = new Set(store.usedDecisionGroups);
    usedDecisionGroups.add(decision.groupId);

    set({
      state: registered.state,
      usedDecisionGroups,
      layoffsThisTurn: layoffs,
      presentationQueue: [...store.presentationQueue, ...registered.presentations],
      decisionUndoStack: [
        ...store.decisionUndoStack,
        {
          optionId,
          state: previous,
          usedDecisionGroups: new Set(store.usedDecisionGroups),
          layoffsThisTurn: store.layoffsThisTurn,
          workersAtTurnStart: store.workersAtTurnStart,
          presentationQueue: [...store.presentationQueue],
        },
      ],
    });
  },

  undoLastDecision: () => {
    const store = get();
    const snapshot = store.decisionUndoStack.at(-1);
    if (
      !snapshot ||
      store.presentationQueue.length > 0 ||
      store.state.pendingEvent ||
      store.state.ending
    ) {
      return;
    }

    set({
      state: snapshot.state,
      usedDecisionGroups: new Set(snapshot.usedDecisionGroups),
      layoffsThisTurn: snapshot.layoffsThisTurn,
      workersAtTurnStart: snapshot.workersAtTurnStart,
      presentationQueue: [...snapshot.presentationQueue],
      decisionUndoStack: store.decisionUndoStack.slice(0, -1),
    });
  },

  endQuarter: () => {
    const store = get();
    if (store.state.pendingEvent || store.state.ending || store.presentationQueue.length > 0) {
      return;
    }

    const advanced = produce(store.state, (draft) => {
      advanceQuarter(draft);
      appendOwnerSignal(draft, undefined);
    });
    const registered = registerDiscoveries(advanced, checkQuarterDiscoveries(advanced));
    const completedTurn = registered.state.history.at(-1)?.turn ?? store.state.turn;
    const periodPresentation: PresentationItem =
      completedTurn % 6 === 0
        ? {
            id: `era-${completedTurn}`,
            kind: "eraRecap",
            startTurn: completedTurn - 5,
            endTurn: completedTurn,
            conceptKeys: Object.values(registered.state.discoveredConcepts)
              .filter(
                (item): item is ConceptDiscovery =>
                  !!item && item.turn >= completedTurn - 5 && item.turn <= completedTurn,
              )
              .map((item) => item.key),
          }
        : {
            id: `summary-${completedTurn}`,
            kind: "summary",
            completedTurn,
          };

    const stories = collectStories(registered.state);
    const marked = markStories(registered.state, stories);
    const eventPresentation: PresentationItem[] = marked.pendingEvent
      ? [
          {
            id: `event-${marked.pendingEvent.id}-${marked.turn}`,
            kind: "event",
            eventId: marked.pendingEvent.id,
          },
        ]
      : [];
    set({
      state: marked,
      usedDecisionGroups: new Set(),
      layoffsThisTurn: 0,
      workersAtTurnStart: marked.workersActive,
      decisionUndoStack: [],
      presentationQueue: [
        ...registered.presentations,
        periodPresentation,
        ...eventPresentation,
        ...storyItems(stories),
      ],
    });
  },

  resolveEvent: (choiceIndex) => {
    const store = get();
    if (!store.state.pendingEvent || store.presentationQueue[0]?.kind !== "event") return;
    const choice = store.state.pendingEvent.choices[choiceIndex];
    if (!choice || (choice.canChoose && !choice.canChoose(store.state))) return;

    const previous = store.state;
    let resolved = produce(previous, (draft) => {
      if (!draft.pendingEvent) return;
      const eventTitle = draft.pendingEvent.title;
      const eventId = draft.pendingEvent.id;
      choice.apply(draft);
      appendOwnerSignal(
        draft,
        choice.ownerStance
          ? {
              turn: draft.turn,
              stance: choice.ownerStance,
              source: `event:${draft.pendingEvent.id}:${choiceIndex}`,
            }
          : undefined,
      );
      draft.decisionHistory.push({
        turn: draft.turn,
        year: draft.year,
        quarter: draft.quarter,
        source: "event",
        id: `${eventId}:${choiceIndex}`,
        label: `${eventTitle}: ${choice.label}`,
        ownerStance: choice.ownerStance,
      });
      draft.log.unshift({
        turn: draft.turn,
        type: "decision",
        text: `${eventTitle}: ${choice.label}`,
      });
      draft.pendingEvent = null;
      if (!draft.ending) draft.ending = checkEnding(draft);
    });
    const registered = registerDiscoveries(
      resolved,
      checkImmediateDiscoveries({
        prev: previous,
        next: resolved,
        cause: "event",
        workersAtTurnStart: store.workersAtTurnStart,
        discovered: previous.discoveredConcepts,
      }),
    );
    resolved = registered.state;
    const eventStories = collectStories(resolved);
    resolved = markStories(resolved, eventStories);
    set({
      state: resolved,
      presentationQueue: [
        ...registered.presentations,
        ...store.presentationQueue.slice(1),
        ...storyItems(eventStories),
      ],
    });
  },

  dismissPresentation: () =>
    set((store) => ({
      presentationQueue: store.presentationQueue.slice(1),
    })),

  showCurrentSummary: () => {
    const store = get();
    const completedTurn = store.state.history.at(-1)?.turn;
    if (!completedTurn || store.presentationQueue.length > 0 || store.state.pendingEvent) {
      return;
    }
    set({
      presentationQueue: [
        {
          id: `manual-summary-${completedTurn}`,
          kind: "summary",
          completedTurn,
        },
      ],
    });
  },

  reset: () => {
    clearEndingReportSnapshot();
    const fresh = withOpening(Date.now() & 0xffff);
    set({
      state: fresh.state,
      usedDecisionGroups: new Set(),
      layoffsThisTurn: 0,
      workersAtTurnStart: fresh.state.workersActive,
      presentationQueue: fresh.queue,
      decisionUndoStack: [],
    });
  },
}));

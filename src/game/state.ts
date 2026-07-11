import { create } from "zustand";
import { produce } from "immer";
import { BAL } from "./balance";
import type {
  AchievementId,
  ActionId,
  ConceptDiscovery,
  ConceptKey,
  GameState,
  PresentationItem,
  QuarterRecord,
} from "./types";
import { ACTIONS } from "./actions";
import { checkActionDiscoveries, checkQuarterDiscoveries } from "./concepts";
import { advanceQuarter } from "./engine/tick";

export const MAX_ACTIONS_PER_TURN = 3;

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
    c: 0,
    v: 0,
    m: 0,
    W: 0,
    profit: 0,
    profitRate: 0,
    profitRateReal: 0,
    exploitation: 0,
    organic: 0,
    contradiction: 20,
    unrest: 15,
    health: 80,
    output: 0,
    demand: BAL.baseDemand,
    inventory: 0,
    sellPrice: BAL.baseSellPrice,
    materialPrice: BAL.baseMaterialPrice,
    laborProductivity: 0,
    individualLaborTime: 0,
    socialLaborTime: BAL.baseSocialLaborTime,
  };
}

export function initialState(seed = Date.now() & 0xffff): GameState {
  return {
    seed,
    turn: 1,
    year: BAL.startYear,
    quarter: BAL.startQuarter,
    companyName: "Müller & Söhne Textilwerk",
    cash: 60000,
    debt: 0,
    machines: 3,
    inventory: 200,
    workersActive: 40,
    workersIdle: 8,
    wagePerWorker: BAL.baseWagePerWorker,
    workHours: BAL.baseWorkHours,
    health: 80,
    unrest: 15,
    contradiction: 20,
    last: emptyRecord(),
    sellPrice: BAL.baseSellPrice,
    materialPrice: BAL.baseMaterialPrice,
    demand: BAL.baseDemand,
    industryProductivity: 1,
    marketShare: 0.2,
    overstockStreak: 0,
    debtStressStreak: 0,
    riotStreak: 0,
    history: [],
    log: [{ turn: 1, type: "system", text: "Ván chơi bắt đầu — quý III năm 1857." }],
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
      draft.log.unshift({
        turn: item.turn,
        type: "concept",
        text: `Khám phá: ${item.key}`,
      });
      const achievementId = ACHIEVEMENT_BY_CONCEPT[item.key];
      if (achievementId && !draft.achievements[achievementId]) {
        draft.achievements[achievementId] = true;
        achievements.push({ id: achievementId, conceptKey: item.key });
      }
    }
  });

  const presentations: PresentationItem[] = [
    ...fresh.map((item): PresentationItem => ({
      id: `eureka-${item.key}-${item.turn}`,
      kind: "eureka",
      conceptKey: item.key,
    })),
    ...achievements.map((item): PresentationItem => ({
      id: `achievement-${item.id}`,
      kind: "achievement",
      achievementId: item.id,
      conceptKey: item.conceptKey,
    })),
  ];
  return { state: next, presentations };
}

export interface GameStore {
  state: GameState;
  usedActions: Set<ActionId>;
  investmentThisTurn: number;
  layoffsThisTurn: number;
  workersAtTurnStart: number;
  presentationQueue: PresentationItem[];
  applyAction: (id: ActionId) => void;
  endQuarter: () => void;
  resolveEvent: (choiceIdx: number) => void;
  dismissPresentation: () => void;
  showCurrentSummary: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialState(),
  usedActions: new Set(),
  investmentThisTurn: 0,
  layoffsThisTurn: 0,
  workersAtTurnStart: 40,
  presentationQueue: [],

  applyAction: (id) => {
    const store = get();
    if (
      store.presentationQueue.length > 0 ||
      store.state.pendingEvent ||
      store.state.ending ||
      store.usedActions.has(id) ||
      store.usedActions.size >= MAX_ACTIONS_PER_TURN
    ) {
      return;
    }

    const action = ACTIONS[id];
    if (!action.canApply(store.state)) return;

    const previous = store.state;
    const nextState = produce(previous, (draft) => {
      action.apply(draft);
      draft.log.unshift({ turn: draft.turn, type: "decision", text: action.title });
    });
    const investment =
      store.investmentThisTurn +
      (id === "BUY_MACHINE" || id === "EXPAND_FACTORY" ? action.cost(previous) : 0);
    const layoffs =
      store.layoffsThisTurn + Math.max(0, previous.workersActive - nextState.workersActive);
    const discoveries = checkActionDiscoveries({
      prev: previous,
      next: nextState,
      actionId: id,
      investmentThisTurn: investment,
      layoffsThisTurn: layoffs,
      workersAtTurnStart: store.workersAtTurnStart,
      discovered: previous.discoveredConcepts,
    });
    const registered = registerDiscoveries(nextState, discoveries);
    const usedActions = new Set(store.usedActions);
    usedActions.add(id);

    set({
      state: registered.state,
      usedActions,
      investmentThisTurn: investment,
      layoffsThisTurn: layoffs,
      presentationQueue: [...store.presentationQueue, ...registered.presentations],
    });
  },

  endQuarter: () => {
    const store = get();
    if (store.state.pendingEvent || store.state.ending || store.presentationQueue.length > 0)
      return;

    const advanced = produce(store.state, (draft) => {
      advanceQuarter(draft);
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

    set({
      state: registered.state,
      usedActions: new Set(),
      investmentThisTurn: 0,
      layoffsThisTurn: 0,
      workersAtTurnStart: registered.state.workersActive,
      presentationQueue: [...registered.presentations, periodPresentation],
    });
  },

  resolveEvent: (idx) => {
    const store = get();
    if (!store.state.pendingEvent || store.presentationQueue.length > 0) return;
    const choice = store.state.pendingEvent.choices[idx];
    if (!choice) return;

    const resolved = produce(store.state, (draft) => {
      if (!draft.pendingEvent) return;
      choice.apply(draft);
      draft.log.unshift({
        turn: draft.turn,
        type: "decision",
        text: `${draft.pendingEvent.title}: ${choice.label}`,
      });
      draft.pendingEvent = null;
    });
    const registered = registerDiscoveries(resolved, checkQuarterDiscoveries(resolved));
    set({
      state: registered.state,
      presentationQueue: [...store.presentationQueue, ...registered.presentations],
    });
  },

  dismissPresentation: () =>
    set((store) => ({ presentationQueue: store.presentationQueue.slice(1) })),

  showCurrentSummary: () => {
    const store = get();
    const completedTurn = store.state.history.at(-1)?.turn;
    if (!completedTurn || store.presentationQueue.length > 0 || store.state.pendingEvent) return;
    set({
      presentationQueue: [
        { id: `manual-summary-${completedTurn}`, kind: "summary", completedTurn },
      ],
    });
  },

  reset: () => {
    const state = initialState();
    set({
      state,
      usedActions: new Set(),
      investmentThisTurn: 0,
      layoffsThisTurn: 0,
      workersAtTurnStart: state.workersActive,
      presentationQueue: [],
    });
  },
}));

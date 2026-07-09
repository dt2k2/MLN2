import { create } from "zustand";
import { produce } from "immer";
import { BAL } from "./balance";
import type { GameState, ActionId, QuarterRecord } from "./types";
import { ACTIONS } from "./actions";
import { advanceQuarter } from "./engine/tick";

function emptyRecord(): QuarterRecord {
  return {
    turn: 0, year: BAL.startYear, quarter: BAL.startQuarter,
    c: 0, v: 0, m: 0, W: 0, profit: 0,
    profitRate: 0, profitRateReal: 0, exploitation: 0, organic: 0,
    contradiction: 20, unrest: 15, health: 80,
    output: 0, demand: BAL.baseDemand, inventory: 0,
    sellPrice: BAL.baseSellPrice, materialPrice: BAL.baseMaterialPrice,
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
    log: [
      { turn: 1, type: "system", text: "Ván chơi bắt đầu — quý III năm 1857." },
    ],
    pendingEvent: null,
    ending: null,
  };
}

interface Store {
  state: GameState;
  usedActions: Set<ActionId>;
  applyAction: (id: ActionId) => void;
  endQuarter: () => void;
  resolveEvent: (choiceIdx: number) => void;
  reset: () => void;
}

export const useGameStore = create<Store>((set, get) => ({
  state: initialState(),
  usedActions: new Set(),
  applyAction: (id) => {
    const { state, usedActions } = get();
    if (usedActions.has(id)) return;
    const act = ACTIONS[id];
    if (!act.canApply(state)) return;
    const next = produce(state, (d) => {
      act.apply(d);
      d.log.unshift({ turn: d.turn, type: "decision", text: act.title });
    });
    const nextUsed = new Set(usedActions);
    nextUsed.add(id);
    set({ state: next, usedActions: nextUsed });
  },
  endQuarter: () => {
    const { state } = get();
    if (state.pendingEvent) return;
    const next = produce(state, (d) => {
      advanceQuarter(d);
    });
    set({ state: next, usedActions: new Set() });
  },
  resolveEvent: (idx) => {
    const { state } = get();
    if (!state.pendingEvent) return;
    const choice = state.pendingEvent.choices[idx];
    const next = produce(state, (d) => {
      if (d.pendingEvent) {
        choice.apply(d);
        d.log.unshift({
          turn: d.turn,
          type: "decision",
          text: `${d.pendingEvent.title}: ${choice.label}`,
        });
        d.pendingEvent = null;
      }
    });
    set({ state: next });
  },
  reset: () => set({ state: initialState(), usedActions: new Set() }),
}));

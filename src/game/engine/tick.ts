import type { GameState } from "../types";
import { checkEnding } from "./endings";
import { tickEffects } from "./effects";
import { rollEvent } from "./events";
import { applySocialUpdate, computeQuarter } from "./laws";
import { tickMarket } from "./market";
import { makeRng } from "./rng";
import { quarterNews } from "../story";

export function advanceQuarter(state: GameState) {
  const rng = makeRng(state.seed + state.turn * 9973);
  const record = computeQuarter(state);

  state.cash += record.reinvestedProfit;
  state.ownerConsumption += record.ownerConsumption;
  state.inventory = record.inventory;

  applySocialUpdate(state, record);
  state.riotStreak = state.unrest >= 80 ? state.riotStreak + 1 : 0;
  state.last = record;
  state.history.push(record);
  if (state.history.length > 40) state.history.shift();

  state.log.unshift({
    turn: state.turn,
    type: "system",
    text: `Q${state.quarter}/${state.year}: lợi nhuận ${record.profit >= 0 ? "+" : ""}$${Math.round(record.profit).toLocaleString("vi-VN")}, p′=${(record.profitRate * 100).toFixed(1)}%`,
  });
  state.log.unshift({ turn: state.turn, type: "news", text: quarterNews(state) });

  state.activeEffects = tickEffects(state.activeEffects);
  state.turn += 1;
  state.quarter += 1;
  if (state.quarter > 4) {
    state.quarter = 1;
    state.year += 1;
  }

  tickMarket(state, rng);

  const ending = checkEnding(state);
  if (ending) {
    state.ending = ending;
  } else {
    const event = rollEvent(state, rng);
    if (event) {
      state.pendingEvent = event;
      state.log.unshift({ turn: state.turn, type: "event", text: event.title });
    }
  }

  if (state.log.length > 40) state.log.length = 40;
}

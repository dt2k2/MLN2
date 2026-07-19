import { BAL } from "./balance";
import type { GameState } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function reconcileAccumulationFund(state: GameState) {
  state.accumulationFund = Math.max(0, Math.min(state.accumulationFund, Math.max(0, state.cash)));
}

export function adjustWage(state: GameState, multiplier: number) {
  state.wagePerWorker *= multiplier;
}

export function hireWorkers(state: GameState, amount: number) {
  reconcileAccumulationFund(state);
  const recalled = Math.min(amount, state.workersIdle);
  const wageAdvance = amount * state.wagePerWorker;
  const fromAccumulation = Math.min(state.accumulationFund, wageAdvance);
  state.accumulationFund -= fromAccumulation;
  state.capitalizedAccumulationThisTurn += fromAccumulation;
  state.workersIdle -= recalled;
  state.workersActive += amount;
  state.socialUnemployment = Math.max(
    0,
    state.socialUnemployment - (recalled + (amount - recalled) * 0.25),
  );
}

export function layoffWorkers(state: GameState, amount: number) {
  const laidOff = Math.min(amount, Math.max(0, state.workersActive - BAL.minimumWorkers));
  state.workersActive -= laidOff;
  state.workersIdle += laidOff;
  state.socialUnemployment = clamp(state.socialUnemployment + laidOff * 0.25);
  return laidOff;
}

export function buyMachine(state: GameState, price: number = BAL.machinePrice) {
  reconcileAccumulationFund(state);
  if (state.cash < price) return false;
  const fromAccumulation = Math.min(state.accumulationFund, price);
  state.cash -= price;
  state.accumulationFund -= fromAccumulation;
  state.capitalizedAccumulationThisTurn += fromAccumulation;
  state.machines += 1;
  state.machineBookValue += price;
  return true;
}

export function sellMachine(state: GameState, proceeds: number = BAL.machineLiquidationValue) {
  if (state.machines <= 1) return false;
  const averageBookValue = state.machineBookValue / Math.max(1, state.machines);
  state.machines -= 1;
  state.machineBookValue = Math.max(0, state.machineBookValue - averageBookValue);
  state.cash += proceeds;
  state.machineDisposalGainLossThisTurn += proceeds - averageBookValue;
  return true;
}

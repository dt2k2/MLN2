import { BAL } from "../balance";
import type { GameState } from "../types";
import { applySocialUpdate, computeQuarter } from "./laws";
import { checkEnding } from "./endings";
import { rollEvent } from "./events";
import { tickMarket } from "./market";
import { makeRng } from "./rng";

/**
 * Chạy 1 quý — mutate draft (dùng với immer).
 * Trả về sự kiện phát sinh (nếu có) để store xử lý.
 */
export function advanceQuarter(s: GameState) {
  const rng = makeRng(s.seed + s.turn * 9973);

  // 1. Tính quý
  const rec = computeQuarter(s);
  s.last = rec;

  // 2. Doanh thu → tiền mặt, tồn kho
  s.cash += rec.profit;
  s.inventory = rec.inventory;

  // 3. Khấu hao & lãi (đã trừ trong profit)
  s.debt *= 1 + BAL.loanRate * 0.0; // lãi đã tính trong rec.profit; nợ gốc giữ nguyên

  // 4. Xã hội
  applySocialUpdate(s, rec);
  if (s.unrest >= 80) s.riotStreak += 1;
  else s.riotStreak = 0;

  // 5. Ghi lịch sử
  s.history.push(rec);
  if (s.history.length > 40) s.history.shift();

  s.log.unshift({
    turn: s.turn,
    type: "system",
    text: `Q${s.quarter}/${s.year}: lợi nhuận ${rec.profit >= 0 ? "+" : ""}$${Math.round(rec.profit).toLocaleString("vi-VN")}, p′=${(rec.profitRate * 100).toFixed(1)}%`,
  });
  if (s.log.length > 30) s.log.pop();

  // 6. Sang quý mới
  s.turn += 1;
  s.quarter += 1;
  if (s.quarter > 4) {
    s.quarter = 1;
    s.year += 1;
  }

  // 7. Market tick
  tickMarket(s, rng);

  // 8. Ending?
  const ending = checkEnding(s);
  if (ending) {
    s.ending = ending;
    return;
  }

  // 9. Event
  const ev = rollEvent(s, rng);
  if (ev) {
    s.pendingEvent = ev;
    s.log.unshift({ turn: s.turn, type: "event", text: ev.title });
  }
}

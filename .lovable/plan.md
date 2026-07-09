## Mục tiêu

Giữ nguyên UI `/game` hiện có (header, 3 panel, charts, modals). Thay các số hardcode bằng **engine mô phỏng Marx** chạy theo lượt (quý), trong đó:

- **Quy luật lớn = tất định**: c, v, m, p′, mâu thuẫn xã hội vận động theo công thức Marx thuần.
- **Sự kiện cụ thể = ngẫu nhiên có kiểm soát**: xác suất phụ thuộc trạng thái (unrest cao → dễ đình công; c/v cao → dễ khủng hoảng thừa; nợ cao → dễ vỡ nợ).
- Không thêm route/màn mới. Không đổi visual.

---

## Kiến trúc code (engine-only, UI giữ nguyên)

```
src/game/
  state.ts        # Zustand store: toàn bộ GameState + selectors
  types.ts        # GameState, Action, EventCard, EndingId
  engine/
    tick.ts       # advanceQuarter(state) → state' (thuần hàm)
    laws.ts       # công thức Marx tất định
    market.ts     # giá bán, cầu, cạnh tranh
    events.ts     # bảng sự kiện + hàm rollEvents(state, rng)
    endings.ts    # checkEnding(state) → EndingId | null
    rng.ts        # mulberry32 seeded RNG (replay được)
  actions.ts      # applyAction(state, actionId, payload) → state'
  balance.ts      # hằng số cân bằng (đặt tập trung để tinh chỉnh)
```

`src/routes/game.tsx` chỉ đổi: bỏ mock const, đọc từ `useGameStore`, dispatch action, gọi `advanceQuarter` khi bấm "Kết thúc quý". Các component con (`DashboardCard`, `ChartCard`, `ActionButton`, modals) nhận props từ store — API prop không đổi.

---

## Vòng lặp một lượt (`advanceQuarter`)

Thứ tự tất định trong 1 quý:

1. **Sản xuất**: `output = min(capacity, workers.active × productivity(machines, health))`
2. **Chi phí bất biến c**: khấu hao máy + nguyên liệu tiêu thụ theo `output × unitMaterial × materialPrice`
3. **Chi phí khả biến v**: `Σ wage × workers.active × workHours/8`
4. **Giá trị mới tạo ra V′**: `workers.active × workHours × valuePerLaborHour(health, skill)`
5. **Giá trị thặng dư m**: `m = V′ − v` (Marx thuần: chỉ lao động sống tạo giá trị mới; c chỉ chuyển giá trị)
6. **Tỷ suất bóc lột**: `m′ = m / v`
7. **Doanh thu W**: bán `min(output + inventory, demand)` theo `sellPrice` do market quyết định; phần thừa vào `inventory`.
8. **Lợi nhuận thực hiện**: `profit = W − (c + v) − debtInterest`
9. **Tỷ suất lợi nhuận**: `p′ = m / (c + v)` (lý thuyết) và `p′_realized = profit / (c+v)` (thực tế) — hiển thị cả hai.
10. **Tích luỹ tư bản**: chia `profit` theo `reinvestRate` → tăng c (máy) hoặc v (tuyển thêm) theo chính sách người chơi.
11. **Cập nhật xã hội**: `health`, `unrest`, `contradiction` (xem phần Laws).
12. **Market tick**: giá nguyên liệu, giá bán, cầu, đối thủ (xem Market).
13. **Roll events**: 0–2 sự kiện theo bảng xác suất.
14. **Check ending**: nếu thoả điều kiện → chuyển route `/ending/*`.

Hàm thuần, nhận `(state, rng)` → `(state', log[])` để dễ test.

---

## Laws — quy luật tất định (`engine/laws.ts`)

- **Xu hướng p′ giảm**: khi người chơi mua máy, `c` tăng nhanh hơn `v` → cấu tạo hữu cơ `q = c/v` tăng → `p′ = m′ / (1 + q)` giảm dù `m′` giữ nguyên. Đây là quy luật lõi, luôn đúng, không random.
- **Sức khoẻ công nhân**:
  `health' = clamp(health + recovery(wage, workHours) − strain(workHours, intensity))`
  Giờ làm > 10h hoặc intensity > 1.2 → strain vượt recovery.
- **Unrest (ngắn hạn)**:
  `unrest' = clamp(unrest + f(workHours) + g(layoffs) + h(wageCut) − relief(wageRaise, workHoursCut))`
- **Contradiction (dài hạn, chỉ tăng/giảm rất chậm)**:
  `contradiction' = contradiction + 0.15 × unrest_avg_this_quarter − reform_bonus`
  Đây là biến "áp lực lịch sử" — không reset khi xoa dịu ngắn hạn, chỉ giảm khi có cải cách cấu trúc (giảm giờ làm vĩnh viễn, chia lợi nhuận).
- **Khủng hoảng thừa (tất định)**: nếu `inventory > 2 × demand` trong ≥ 2 quý liên tiếp → `sellPrice × 0.7`, `demand × 0.6`, kích hoạt event "Khủng hoảng sản xuất thừa" (100%).
- **Nợ**: `debt' = debt × (1 + rate) − repayment`; `debt > 3 × capital` trong 2 quý → phá sản.

---

## Market & cạnh tranh (`engine/market.ts`)

- 3 đối thủ AI vô hình, mỗi quý cập nhật `avgIndustryProductivity`.
- `sellPrice` giảm dần theo `avgIndustryProductivity` (giá trị xã hội của hàng hoá giảm khi năng suất chung tăng) → buộc người chơi đầu tư máy để không tụt hậu, nhưng chính hành động đó lại đẩy `c/v` lên → tái hiện mâu thuẫn Marx.
- `materialPrice`: dao động ±15%, thỉnh thoảng shock (chiến tranh thuộc địa) qua event.
- `demand`: hàm chu kỳ 8 quý (boom/bust) + nhiễu nhỏ.

---

## Sự kiện ngẫu nhiên có kiểm soát (`engine/events.ts`)

Bảng ~15 event, mỗi cái có `weight(state)` trả xác suất:

| Event | weight phụ thuộc |
|---|---|
| Đình công | `unrest`, `workHours`, health thấp |
| Bạo động | `contradiction > 60` |
| Phát minh máy dệt mới | thời gian + đầu tư máy |
| Dịch tả | ngẫu nhiên nền + mật độ công nhân |
| Luật Xưởng máy | `contradiction > 40` (áp lực chính trị) |
| Khủng hoảng tín dụng | `debt/capital` cao |
| Bông thô shock giá | ngẫu nhiên nền |
| Công đoàn thành lập | unrest tích luỹ |
| Nhà đầu tư mời hợp tác | profit cao |
| … |

`rollEvents` dùng RNG seeded → replay được, dễ debug.
Event dùng `EventModal` sẵn có; hai lựa chọn → mutate state qua `applyEventChoice`.

---

## Endings (`engine/endings.ts`)

Check sau mỗi quý, theo thứ tự ưu tiên:

1. **Cách mạng vô sản** → `/ending/revolution`
   `contradiction ≥ 100` HOẶC (`unrest ≥ 90` và có event bạo động 2 quý liên tiếp).
2. **Phá sản** → `/ending/bankruptcy`
   `capital ≤ 0` HOẶC `debt > 3 × assets` 2 quý.
3. **Độc quyền tư bản** (win kiểu tư bản) → `/ending/revolution` (tạm dùng route hiện có, đổi text) hoặc tạo `/ending/monopoly` sau.
   `marketShare ≥ 60%` và sống sót 24 quý.
4. **Cải cách xã hội** (win kiểu điều hoà)
   Kết thúc 24 quý với `contradiction < 40` và `health > 70` và có lợi nhuận dương.
5. **Hết 24 quý mặc định**: chấm điểm.

Lần này chỉ dùng 2 route ending có sẵn (`revolution`, `bankruptcy`); các ending khác đánh dấu TODO, tạm map về summary modal.

---

## Actions (`actions.ts`)

Mỗi action = pure reducer, khớp 6 nút hiện có:

- `EXTEND_HOURS` — `workHours += 2` (cap 16), preview tính đúng từ laws.
- `RAISE_WAGE` — `wage × 1.1`.
- `BUY_MACHINE` — `c += price`, `capacity += Δ`, `machines += 1`.
- `EXPAND_FACTORY` — mở capacity lớn, tốn tiền + rủi ro nợ.
- `LAYOFF` — `workers.active -= n`, unrest +.
- `BORROW` — `debt += n`, `capital += n`.

Preview trên `ActionButton` sinh bằng cách chạy `simulate(state, action)` (dry-run 1 quý, không commit) → số hiển thị luôn khớp thực tế.

---

## Tích hợp UI

- `game.tsx`: thay hardcode bằng `useGameStore(selectors)`.
- `profitTrend`, `capitalRatio`, market cards: đọc từ `state.history[]` do engine ghi lại.
- Nút "Kết thúc quý": `store.endQuarter()` → chạy `advanceQuarter` → nếu có event → mở `EventModal` với payload thật → sau khi chọn → mở `TurnSummaryModal` với số thật.
- `MobileWarning`, layout, màu, font: không đổi.

---

## Chi tiết kỹ thuật (dành cho dev)

- Zustand + `immer` middleware để reducer viết mutable dễ đọc.
- RNG: `mulberry32(seed)`; `seed` lưu trong state → replay/save game về sau dễ.
- Engine 100% pure, không đụng React → viết unit test với `bunx vitest` (không bắt buộc lần này, nhưng cấu trúc sẵn sàng).
- Không thêm dependency mới nếu không cần (`immer` đã có qua zustand `immer` middleware — cài thêm nếu thiếu: `bun add zustand immer`).
- `balance.ts` gom mọi hằng số (giá máy, wage cơ bản, hệ số strain…) để tinh chỉnh không phải sửa logic.

---

## Ngoài phạm vi lần này

- Không đổi visual/layout.
- Không thêm route ending mới (dùng 2 route có sẵn).
- Không thêm i18n, không thêm save/load, không thêm audio.
- Concept codex (mở khoá khái niệm theo hành động) sẽ làm ở lần sau — engine đã ghi log đủ để hook vào.

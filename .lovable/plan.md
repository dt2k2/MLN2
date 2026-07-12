
# Thu nhỏ Cán cân lịch sử + thêm Hero animation chủ xưởng Heinrich

Ý tưởng: Ô hero bên trái (đang là `HistoricalScale variant="hero"`) sẽ được chia thành 2 phần:
- **Trên (~60%)**: Heinrich — chủ xưởng, animation SVG với biểu cảm thay đổi theo tình hình.
- **Dưới (~40%)**: Cán cân lịch sử ở dạng thu gọn (variant `card` hiện có, nhưng thêm chút polish).

## 1. Component mới: `src/components/game/heinrich-portrait.tsx`

SVG chân dung nửa người của Heinrich đứng trước cửa sổ nhìn ra xưởng, style tranh khắc gỗ (cùng tone với intro art). Tất cả bằng SVG + framer-motion, không cần ảnh raster.

**Cấu trúc SVG (viewBox 0 0 240 260):**
- Background: cửa sổ chia ô, khói nhà máy phía sau (drift animation).
- Body: áo vest cổ cao, cà-vạt đen, đồng hồ quả quýt (dây xích lấp lánh khi cash cao).
- Head: hình oval, tóc chải ngược, ria mép, mắt, lông mày, miệng — mỗi bộ phận là 1 `<g>` để hoán đổi theo mood.
- Tay: 1 tay chống hông / vuốt cằm / nắm đấm — biến theo mood.
- Prop phụ (bàn phía trước): xì gà (khói bay khi `content`), ly rượu (nghiêng khi `crisis`), giấy tờ (bay tung khi `rupture`).

**Mood dẫn xuất từ `readScale(state)` + vài field state:**

```ts
type Mood =
  | "content"       // profit tốt, unrest thấp → cười khẩy, xì gà
  | "greedy"        // accumulation phase, cash tăng → mắt sáng, xoa tay
  | "stressed"      // exploitation, workHours cao → nhíu mày, lau mồ hôi
  | "worried"       // crisis / inventory cao → cắn môi, tay chống trán
  | "furious"       // unrest > 70 → đỏ mặt, đập bàn
  | "defeated"      // rupture / debt cao → cúi đầu, tay ôm mặt
  | "triumphant";   // marketShare > 0.5 & profit cao → ngẩng cao, cười lớn
```

Rule chọn mood (theo thứ tự ưu tiên):
1. `phase === "rupture"` hoặc `contradiction >= 85` → `defeated`
2. `unrest >= 70` → `furious`
3. `phase === "crisis"` hoặc `overstockStreak >= 2` → `worried`
4. `phase === "exploitation"` hoặc `workHours >= 13` → `stressed`
5. `marketShare >= 0.5 && profitRateReal > 0.15` → `triumphant`
6. `phase === "accumulation"` hoặc `cash > 60000` → `greedy`
7. else → `content`

**Biểu cảm — thay đổi cụ thể:**
| Mood | Mắt | Lông mày | Miệng | Tay/Body | FX |
|---|---|---|---|---|---|
| content | mở vừa | thẳng | mỉm cong nhẹ | chống hông | khói xì gà nhẹ |
| greedy | híp, hai chấm sáng $ | cong lên | cười lệch | xoa hai tay | xu vàng rơi lấp lánh |
| stressed | mở to | nhíu | mím chặt | lau trán | mồ hôi giọt |
| worried | nhìn xuống | chữ V ngược | méo xệch | ôm cằm | ly rượu nghiêng |
| furious | trợn, đỏ | dốc xuống | há gào | nắm đấm giơ | mặt đỏ + rung mạnh |
| defeated | nhắm | rũ | mở nhẹ | ôm mặt | giấy tờ bay, khói xám |
| triumphant | mở | cong | cười to | giơ ly | tia sáng vàng |

**Motion:**
- Idle: thở nhẹ (`scale y 1 → 1.01`, 3s loop).
- Chớp mắt ngẫu nhiên 3–6s.
- Chuyển mood: `AnimatePresence` fade + `scale-in` 0.4s cho từng bộ phận thay.
- Hover: tooltip text mô tả tâm trạng ("Heinrich đang lo lắng vì hàng tồn kho…").

**Header trong panel:**
- Tên "HEINRICH" + chip mood (uppercase, phase color).
- Dòng phụ: một câu độc thoại ngắn thay theo mood — mảng 3–4 câu / mood, random khi mood đổi.
  - Ví dụ furious: *"Bọn chúng dám đình công?! Đuổi hết!"*, *"Không ai được rời máy!"*.
  - Ví dụ worried: *"Kho đầy… mà không ai mua."*.
  - Ví dụ defeated: *"Có lẽ… tôi đã sai."*.

## 2. Sửa `src/routes/game.tsx` (left panel)

```tsx
<section className="... lg:col-span-3 ...">
  <HeinrichPortrait state={state} />        {/* mới, flex-1 */}
  <HistoricalScale state={state} variant="card" />  {/* thu về card */}
  <div className="panel-industrial ...">Lực lượng lao động …</div>
</section>
```

Bỏ `variant="hero"`. Không đổi logic `HistoricalScale` — chỉ dùng bản `card` sẵn có (bỏ block `isHero`, không cần chỉnh code).

## 3. Không đụng

- Không đổi game logic, không đổi `pressures.ts`, không đổi state.
- Không cần asset ảnh mới — toàn bộ Heinrich là SVG inline.
- `ContradictionCard` giữ nguyên vị trí center.

## Tệp thay đổi
- **Tạo**: `src/components/game/heinrich-portrait.tsx`
- **Sửa**: `src/routes/game.tsx` (thay layout left panel)

Tổng cộng ~1 file mới ~350 dòng SVG + 1 chỉnh nhỏ ở route.

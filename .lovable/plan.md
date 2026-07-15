# Mở rộng tutorial: Đọc Dashboard + 2 sửa UI

Bổ sung hướng dẫn đọc dashboard theo 3 chapter A/B/C dưới dạng **sub-step trong 8 bước tutorial hiện có** (không thêm bước chính, không đụng engine/kinh tế/concept trigger). Thêm 2 sửa UI về hiển thị c/v/m rỗng và nhãn "Phần cầu của xưởng".

## 1. Sub-step trong tutorial (giữ 8 bước chính)

Mở rộng `TutorialStep` để mỗi bước có thể chứa nhiều "trang" nội dung spotlight vào các target khác nhau, dùng cùng một panel + nút "Xem chỉ số tiếp theo / Tiếp tục". Sub-step không đếm vào "Bước n/8".

`src/tutorial/types.ts`:

- Thêm target mới: `market-demand-industry`, `market-supply-industry`, `market-firm-demand`, `market-output`, `market-price`, `market-share`, `cvm-chart`, `profit-chart`, `contradiction`, `header-fund`, `header-debt`, `header-next-interest`, `header-debt-ratio`, `historical-scale`, `historical-scale-capital`, `historical-scale-labor`, `historical-scale-market`.
- Đổi `TutorialStep` sang: `pages: TutorialPage[]` với `TutorialPage = { target, title, body(state) | body, placement?, showIf?(state), nextLabel? }`. Trường `advance` đặt ở page cuối. Bước chỉ có 1 page giữ y hệt hiện tại.

`src/tutorial/steps.ts` — chèn sub-step:

- **Bước 2 "Tiền mặt & khoản nợ"** (Chapter C.1–C.5): sub-page `header-cash` (tiền mặt), `header-fund` (quỹ tích lũy — nhấn "vẫn nằm trong cash, không cộng thêm"), `header-debt` (dư nợ), `header-next-interest` (lãi quý tới), `header-debt-ratio` (nợ/tài sản, dùng số thực từ state).
- **Bước mới 2b "Đọc thị trường" (Chapter A)** — chèn giữa bước 2 và bước 3 hiện tại nhưng vẫn cùng 1 stepIndex; gán nó vào bước hiện có "indicators" ở dạng sub-page đầu: `market-demand-industry` → `market-supply-industry` → `market-firm-demand` → `market-output` (dùng câu "trước quý đầu") → `market-price` → `market-share` → câu tổng kết "thị phần → sản xuất → thị trường quyết định bán được bao nhiêu".
- **Bước 3 "indicators"** giữ nguyên 4 KPI c/v/m/p′ (đã có), sau đó thêm sub-page `contradiction` (Chapter B.3 — dải trạng thái Yên/Căng/Bất ổn/Nguy hiểm/Đứt gãy), rồi `historical-scale` với 4 sub-page nhỏ: tổng quan cán cân + 3 trục (Chapter C.6), mỗi trục có body(state) đọc `readScale(state)` để chèn số thật (ví dụ "Tư bản 8, Lao động 19, Thị trường 5 — sức ép lao động nổi bật hơn ...").
- **Bước 8 "summary"** sau khi quý đầu kết thúc: thêm sub-page `cvm-chart` (Chapter B.1) và `profit-chart` (Chapter B.2) dùng `state.history[last]` để chèn số thật ("Quý vừa rồi hiệu suất vốn thực tế là X%…"). Ẩn sub-page này khi `state.history.length === 0` (guard sẵn: bước 8 chỉ chạy sau quý đầu).

Body hai loại: `string` cho text tĩnh, hoặc `(state: GameState) => string` cho text có số thực. Loader kiểm tra `state.discoveredConcepts[key]` để dùng ngôn ngữ vận hành trước khi concept mở khóa (không gọi "quy luật tỷ suất lợi nhuận giảm dần", "giá trị thặng dư" khi chưa discover).

## 2. TutorialOverlay — hỗ trợ sub-step

`src/components/tutorial/TutorialOverlay.tsx`:

- Store thêm `pageIndex` + actions `nextPage/prevPage`. `next()` hiện tại tăng `pageIndex`; nếu vượt số page trong step, tăng `stepIndex` và reset `pageIndex = 0`. `previous()` ngược lại.
- Panel dùng `pages[pageIndex]` để render title/body/target/placement. Nút chính hiển thị "Xem chỉ số tiếp theo" nếu còn page trong step, "Tiếp tục" nếu là page cuối, "Chờ thao tác" nếu advance != manual.
- Body có thể là function → gọi với `useGameStore.getState().state` (đọc reactive qua selector cho page hiện tại).
- Thêm link "Tìm hiểu thêm" (footer nhỏ, chỉ hiện khi page có `learnMoreAnchor`) → mở `/how-to-play#<anchor>` ở tab mới.
- Không dùng hover làm advance duy nhất (đã manual). Đảm bảo pointer/click/focus/touch đều nhận trên nút "Tiếp tục".
- Ẩn/bỏ page tự động khi `showIf?(state) === false` (ví dụ profit-chart & cvm-chart khi `history.length === 0`).

Store `src/tutorial/state.ts`:

- Thêm `pageIndex: number`, reset khi `start/restart/next-step/previous-step`.
- `currentPage()` trả `pages[pageIndex]`.
- `onDecisionApplied/onQuarterEnded` chỉ advance khi ở page cuối và advance kind khớp.

## 3. Đánh dấu target UI mới

`src/routes/game.tsx`:

- Thêm `data-tutorial="market-demand-industry|market-supply-industry|market-firm-demand|market-output|market-price|market-share"` trên từng `MarketCard` tương ứng.
- Thêm `data-tutorial="cvm-chart"` trên `ChartCard` cấu thành giá trị, `data-tutorial="profit-chart"` trên container `<ProfitChart>`, `data-tutorial="contradiction"` trên container `<ContradictionCard>`, `data-tutorial="historical-scale"` trên `<HistoricalScale>` wrapper.
- Trong `GameHeader` (`src/components/game/game-header.tsx`) đã có `header-cash`, thêm `header-fund`, `header-debt`, `header-next-interest`, `header-debt-ratio` trên các ô tương ứng.
- Trong `HistoricalScale`, gắn `data-tutorial` trên 3 `PressureBar` (`historical-scale-capital/labor/market`) — chỉ dùng cho scroll spotlight.

Không thay layout/CSS, chỉ thêm attribute.

## 4. Hai sửa UI (ngoài tutorial)

**a) Ẩn c/v/m 0% và chart trống khi chưa có quý.** `src/routes/game.tsx`:

- Điều kiện `state.history.length === 0` (hoặc `last.commodityValue <= 0`) → thay body của `ChartCard` "Cấu thành giá trị" bằng placeholder: `<div className="flex h-[110px] items-center justify-center text-xs text-muted-foreground">Chưa có dữ liệu quý</div>`.
- Tương tự `ProfitChart`: khi `data.length === 0` (đã `slice(-12)` của history), render placeholder tương tự trong chính component; giữ tiêu đề để tránh nhảy layout.
- Sửa contrast: dòng legend "c/v/m" đang dùng `<span className="text-[color:var(--info)]">■</span>` v.v. Kiểm tra token và chuyển `text-muted-foreground` bao ngoài thành `text-foreground/80`; đảm bảo giá trị `%` không dùng màu đen trên nền đen (đổi class base thành `text-foreground/80`).

**b) Đổi nhãn "Phần cầu của xưởng" → "Cầu dành cho xưởng"** trong `game.tsx` MarketCard. Chỉ đổi label hiển thị, không đổi biến/state/công thức. Cập nhật cùng chuỗi ở body tutorial page.

## 5. Contextual hints bổ sung (Chapter C.6 khi cán cân lệch)

`src/tutorial/hints.ts` & `types.ts`: thêm 4 hint mới (chỉ trigger sau khi tutorial chính complete/skipped, đúng cơ chế observer sẵn có):

- `scale-capital-high`: khi `readScale(state).capital` vượt ngưỡng (>60) lần đầu.
- `scale-labor-high`: `labor` > 60.
- `scale-market-high`: `market` > 60.
- `scale-multi-high`: ≥2 trục > 55 đồng thời.

Predicate `detectHint` mở rộng: import `readScale` từ `@/game/pressures`, so sánh prev vs next. Mỗi hint chỉ 1 lần (đã có logic `seenHints`).

## 6. Trang "Hướng dẫn" (deep-dive)

`src/routes/how-to-play.tsx`: thêm các section với `id` khớp `learnMoreAnchor` — Thị trường, Cấu thành giá trị, Hiệu suất vốn, Áp lực xã hội, Tài chính, Cán cân lịch sử. Nội dung dài hơn 2–4 câu overlay. Không đổi nút "Chơi lại hướng dẫn" hiện có.

## 7. Tests

- `src/tutorial/steps.test.ts`: page cuối advance khớp; sub-step không tăng `stepIndex`; `showIf` ẩn page cvm/profit khi `history.length === 0`.
- `src/tutorial/state.test.ts`: `next()` chuyển page trước khi chuyển step; `previous()` vượt page đầu về step trước.
- `src/tutorial/hints.test.ts`: 4 hint scale mới chỉ trigger 1 lần và không trigger khi modal mở (đã cover ở observer).
- Không đụng `simulation.test.ts`, `concepts.test.ts`, `engine/events.test.ts`.

## 8. Production gate

`bunx vitest run`, `bunx tsgo --noEmit`, ESLint, build. Playwright smoke 1440×900: bắt đầu game → xem toàn tutorial (bao gồm sub-step market + cán cân dùng số thật) → kết thúc quý đầu → sub-step cvm/profit hiện; smoke 360×800: panel là bottom sheet, spotlight scroll target vào giữa.

## Ghi chú kỹ thuật

- Số thực trong body dùng closure `(state) => string`; overlay đọc `useGameStore((s) => s.state)` một lần và truyền xuống.
- Không cache label ẩn; chart placeholder giữ nguyên khung để tránh layout shift.
- Không đụng `state.ts` engine, `decisions.ts`, `pressures.ts`, `concepts.ts`, `balance.ts`.
- Nhãn dải trạng thái áp lực xã hội chỉ là text UI trong `ContradictionCard`; không đổi threshold trong engine.

&nbsp;

```
Điều chỉnh plan trước khi triển khai:

1. Giảm số sub-page: gom các KPI cùng chủ đề, không tạo hơn 10–12 lần bấm nội dung trước quyết định đầu tiên.
2. Cán cân Lịch sử thể hiện mức áp lực, không phải sức mạnh. Không mô tả capital là sức mạnh tài chính.
3. Các page header-debt/header-next-interest/header-debt-ratio phải có showIf debt > 0 và nội dung fallback khi không có nợ.
4. Render body động bằng Zustand selector reactive, không dùng getState() làm nguồn render chính.
5. Phân biệt “chưa có dữ liệu quý” với “quý có sản lượng/commodityValue bằng 0”.
6. Kiểm tra scale-multi-high trước hint đơn lẻ và chỉ trigger khi giá trị vừa vượt ngưỡng.
7. Không gọi ba trục là phần trăm hoặc thang 0–100 nếu readScale vẫn có capital/labor tối đa 120.
8. PressureBar cần nhận tutorialId để gắn data-tutorial thực sự.
9. Deep link Hướng dẫn phải dùng TanStack Router và giữ nguyên game state.
```
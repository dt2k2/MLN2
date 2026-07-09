# Plan — Cải thiện tương tác & polish UI cho `/game`

Chỉ chạm lớp UI/presentation. Không đổi engine (`src/game/*`).

## 1. Kiến trúc thêm mới

Tạo các component mới trong `src/components/game/`:

- `stat-tooltip.tsx` — Radix Tooltip wrapper hiển thị định nghĩa Marx + công thức + diễn giải bối cảnh cho từng chỉ số (c, v, m, p′, mâu thuẫn). Nội dung tra từ 1 bảng const `CONCEPT_INFO` mới trong `src/game/concepts.ts`.
- `action-preview.tsx` — panel nhỏ hiện dưới ActionButton khi hover: tính thử `nextState` bằng cách clone state qua immer và gọi `ACTIONS[id].apply(draft)`, sau đó chạy `computeQuarter` từ `engine/laws.ts` để so sánh Δ của `c, v, m, p′, contradiction`. Chỉ dùng cho preview — không mutate store.
- `achievement-toast.tsx` — dùng `sonner` (đã có `<Toaster />`) với custom render: nền amber tối, icon `Award`, tiêu đề + phụ đề "Mở khóa: … trong Codex". Export `showAchievement({title, subtitle})`.
- `codex-panel.tsx` — panel `fixed bottom-0` height 200px, slide-up bằng `AnimatePresence`, hiển thị: định nghĩa đầy đủ, công thức, quote Marx, timestamp "Lần khám phá: Quý N, YYYY".
- `end-turn-button.tsx` — tách nút "Kết thúc quý" ra, quản lý state loading 1.5s, dispatch `endQuarter` sau delay, phát event `window.dispatchEvent(new CustomEvent('quarter-ended', {detail: {prevProfitRate}}))` để các card khác phản ứng.
- `contradiction-card.tsx` — tách riêng để dễ pulse border khi > 60%, toast khi crossing 75%, overlay đỏ full-screen khi ≥ 100%.
- `profit-chart.tsx` — tách chart p′ ra: thêm animated dot (`<Dot>` custom + framer-motion), phase labels trên XAxis (`Khởi nghiệp` Q1–Q6, `Tối ưu hóa` Q7–Q12, `Khủng hoảng` Q13–Q18, `Đỉnh cao` Q19–Q24), tooltip custom hiển thị giá trị + phase, gradient amber đã có sẵn (giữ + tăng opacity nhẹ).

Bảng khái niệm `src/game/concepts.ts`:
```ts
export const CONCEPT_INFO = {
  c: { title, definition, formula, context: (s) => string },
  v: {...}, m: {...}, pRate: {...}, contradiction: {...}
}
```
`context(state)` sinh câu như "c/v hiện = 2.4 → cấu tạo hữu cơ cao, p′ đang bị nén."

## 2. Sửa file hiện có

### `src/routes/game.tsx`
- Wrap 4 `DashboardCard` bằng `StatTooltip` (nhận `conceptKey`).
- Thay khối "Mâu thuẫn giai cấp" ChartCard bằng `<ContradictionCard value={contradictionInt} unrest={state.unrest} />`.
- Thay ChartCard "Xu hướng p′" bằng `<ProfitChart data={profitTrend} turn={state.turn} />`.
- Trong mỗi ActionButton wrapper: bọc bằng `<HoverCard>` (shadcn) hoặc div group + `<ActionPreview state={state} actionId={id} />`.
- Thay motion.button "Kết thúc quý" bằng `<EndTurnButton onEnd={() => { endQuarter(); setSummary(true); }} prevProfitRate={last.profitRate} />`.
- Chip "Từ điển khái niệm": khi click concept chip → mở `CodexPanel` thay vì `ConceptModal` (giữ ConceptModal cho Eureka popup).
- Thêm hook `useContradictionAlerts(state.contradiction)` — theo dõi crossing 75%, gọi `toast.warning`.
- Sau `endQuarter`: kiểm tra điều kiện Eureka (unlock concept mới) → gọi `showAchievement(...)` + mở `ConceptModal`. Điều kiện mẫu: `last.exploitation >= 2` → "Nhà tư bản máu lạnh".

### `src/components/game/dashboard-card.tsx`
- Thêm prop `flashDown?: boolean` — khi true, border đỏ + `animate-shake` 500ms. Dùng cho p′ card khi giảm.
- Thêm prop `tooltip?: React.ReactNode` — nếu có, wrap trong Tooltip.

### `src/components/game/mobile-warning.tsx` → xóa hoặc chỉnh
- Bỏ block chặn desktop-only. Layout mobile:
  - `flex flex-col` mặc định, chuyển `lg:` cho grid 12 cột hiện tại.
  - Stack: Header → 4 stat card grid-cols-2 → chart p′ → contradiction card → actions full-width → factory scene.
  - Codex: FAB tròn `fixed bottom-4 right-4` "📚 5/15", tap mở `CodexPanel`.
  - Ẩn panel DEV trên mobile.

### `src/styles.css`
- Thêm keyframe `shake` (translateX ±3px) + utility `.animate-shake`.
- Thêm keyframe `pulse-danger` (border-color đỏ, 2s infinite) + utility.
- Thêm keyframe `tick` cho turn counter (scale 1 → 1.3 → 1, 300ms).

### `src/components/game/game-header.tsx`
- Turn counter: bọc số turn trong `<motion.span key={turn} initial={{scale:1.3}} animate={{scale:1}}>` để tick khi tăng.

## 3. Cài đặt lib

Nếu chưa có: `bun add @radix-ui/react-tooltip @radix-ui/react-hover-card` (kiểm tra `components.json` / `src/components/ui/` trước; shadcn thường đã có tooltip). Sonner đã có sẵn.

## 4. Verify

- `tsgo` typecheck.
- Playwright: mở `/game`, click "Kết thúc quý", screenshot 3 lần (trước, đang loading, sau) để xác nhận số nhảy + tick.
- Hover 1 action button → screenshot preview panel.
- Resize viewport 375px → screenshot mobile stack.

## Ngoài phạm vi

- Không đổi công thức Marxian, không thêm action mới, không đổi ending logic, không thêm i18n / audio / save-load. Tất cả logic mới chỉ nằm trong lớp UI.

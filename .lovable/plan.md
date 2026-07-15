# Tutorial "Người điều hành mới" — Das Kapitalist

Xây một lớp hướng dẫn quan sát trạng thái game và spotlight các control có sẵn. Không đổi kinh tế/event/concept/balance. Không đổi presentation queue.

## 1. Kiến trúc mô-đun

Tạo thư mục mới `src/tutorial/` — tách biệt hoàn toàn khỏi `src/game/`:

- `src/tutorial/types.ts` — `TutorialStepId`, `TutorialTarget`, `TutorialDefinition`, `TutorialState`, `ContextualHintId`, `TutorialVersion`.
- `src/tutorial/steps.ts` — mảng 8 bước chính (nội dung tiếng Việt theo spec). Mỗi step: `id`, `targetId`, `title`, `body`, `advance` ("manual" | { kind: "decision-applied" } | { kind: "quarter-ended" } | { kind: "queue-empty" } | { kind: "preview-viewed" }), `pickSafeDecision?(state)` trả về `DecisionOptionId` gợi ý (mặc định `RAISE_WAGE` nếu hợp lệ), `openGroup?: DecisionGroupId`.
- `src/tutorial/hints.ts` — bảng contextual hint (7 loại theo spec) + predicate `shouldTrigger(state, prevState)` chạy dựa trên `state.history` cuối và diff.
- `src/tutorial/storage.ts` — read/write `localStorage` key `das-kapitalist:tutorial:v1` với schema `{ version, completed, skipped, seenHints: string[] }`; guard `typeof window` và try/catch; migration khi bump version bỏ qua dữ liệu cũ chứ không crash.
- `src/tutorial/state.ts` — zustand store `useTutorialStore` với: `active`, `stepIndex`, `completedSteps`, `seenHints`, `pendingHint`, `awaitingAction`; actions `start/next/previous/skip/complete/restart/dismissHint/observeGameChange`.
- `src/tutorial/observer.tsx` — component vô hình gắn 1 lần ở `game.tsx`, subscribe `useGameStore` và gọi `observeGameChange` khi state thay đổi (kiểm tra queue, applied decision, end of quarter, contextual hint triggers).

Tutorial state hoàn toàn tách khỏi `useGameStore`. Không thêm gì vào `GameState`.

## 2. Component overlay

`src/components/tutorial/`:

- `TutorialOverlay.tsx` — root. Nếu `active` và không có presentation modal đang mở (`presentationQueue.length === 0 && !pendingEvent`), render:
  - `Spotlight`: portal dùng `getBoundingClientRect()` của target element (attribute `data-tutorial="{id}"`) để vẽ mask SVG có "khoét lỗ" (rect radius) + backdrop `bg-black/55`. Không chặn pointer trên vùng khoét (pointer-events: none trên overlay, mask cho vùng ngoài).
  - `TutorialPanel`: tooltip đặt bằng `@radix-ui/react-popper` (đã có với shadcn) hoặc tính toán thủ công. Có `title`, `body` (2-4 câu), footer với `Bước n/8`, nút `Quay lại` / `Tiếp tục` / `Bỏ qua`. Nút Tiếp tục bị disable khi `awaitingAction` true. Trên mobile (<768px) chuyển thành bottom sheet.
  - `role="dialog"` + `aria-live="polite"` cho body; announce khi step đổi.
  - Animation opacity/translate 220ms; tôn trọng `prefers-reduced-motion`.
- `CoachMark.tsx` — cho contextual hint. Popover nhỏ neo vào target, đóng bằng nút X hoặc Esc; không có Backdrop.
- `SkipConfirmDialog.tsx` — reuse `AlertDialog` shadcn cho bỏ qua tutorial chính.

Icon dùng từ `lucide-react` (`Lightbulb`, `ArrowLeft`, `ArrowRight`, `X`, `SkipForward`).

## 3. Đánh dấu target trong UI hiện tại

Thêm attribute `data-tutorial="..."` (không đổi layout/CSS) tại các điểm ở `src/routes/game.tsx`:

- `header-turn` — vùng lượt/quý trong `GameHeader` (thêm ở `game-header.tsx`).
- `header-cash`, `header-debt`, `header-fund` — 3 ô KPI trong header.
- `dash-c`, `dash-v`, `dash-m`, `dash-profit` — 4 `DashboardCard` chính.
- `contradiction` — `ContradictionCard`.
- `decision-panel`, `decision-tabs`, `decision-group-{id}` — panel bên phải + từng TabsTrigger.
- `end-quarter` — `EndTurnButton`.
- `summary-modal-root` — thêm vào TurnSummaryModal cho step 8.

## 4. 8 bước chính (bám spec)

Bảng step (id → target → advance):

```text
1 objective          header-turn           manual
2 cash-debt          header-cash           manual (spotlight lần lượt cash → debt qua sub-step)
3a costs             dash-c                manual
3b wages             dash-v                manual
3c surplus           dash-m                manual
3d profit            dash-profit           manual
3e pressure          contradiction         manual
4 decisions          decision-panel        manual (giải thích 6 nhóm, spotlight tabs)
5 preview            decision-group-WAGES  preview-viewed (mở tab, chờ user hover/click 1 option → phát hiện qua onMouseEnter set flag)
6 apply              decision-panel        decision-applied (bất kỳ quyết định hợp lệ nào)
7 end-quarter        end-quarter           quarter-ended
8 summary            summary-modal-root    manual (chỉ chạy SAU khi queue có summary được đóng)
```

Text tiếng Việt lấy nguyên từ spec (không dùng thuật ngữ Marxist trước khi concept discovered → check `state.discoveredConcepts[key]` và fallback ngôn ngữ vận hành).

Vì quyết định apply ngay khi click (không có confirm step), step 5 giải thích rõ: *"Đưa chuột lên một lựa chọn để xem preview. Khi bạn click, quyết định sẽ áp dụng ngay lập tức."* → advance qua `onMouseEnter` trên option button trong tab WAGES. Step 6 tách riêng để user chọn hành động an toàn.

## 5. Luồng đồng bộ với gameplay

Trong `observer.tsx`:

- Subscribe `state.presentationQueue`, `state.pendingEvent`, `state.ending` → set `paused` khi có bất cứ modal educational nào. Overlay ẩn khi paused, không unmount step.
- Subscribe `usedDecisionGroups` (từ store) → khi tăng, và step hiện tại chờ `decision-applied`, gọi `next()`.
- Subscribe `state.history.length` → khi tăng, và step chờ `quarter-ended`, chờ queue trống rồi advance sang step 8.
- Chạy `hints.ts` triggers sau mỗi state change nếu tutorial chính đã complete/skip, chỉ trigger khi không có modal đang mở, và chỉ 1 hint/lượt.

Nếu target chưa mount (ví dụ tab decision khác đang active), step tự set `activeGroup` thông qua ref callback được `game.tsx` truyền vào tutorial context (`setActiveDecisionGroup`).

## 6. Điểm khởi động

- Sau khi user đóng chapter "Sổ cái thừa kế" — dùng `useEffect` trong `game.tsx`: khi `presentationQueue` chuyển từ non-empty → empty lần đầu ở turn 1 và storage cho biết chưa complete/skip, gọi `tutorial.start()`.
- Menu tạm dừng (nút Pause hiện có) + trang `/how-to-play`: thêm mục "Chơi lại hướng dẫn" gọi `restart()` rồi `navigate("/game")`.

## 7. Reset game

`useGameStore.reset()` không đụng tutorial storage. Tutorial storage chỉ bị wipe khi user bấm "Chơi lại hướng dẫn" (không phải "Chơi lại"). Test đảm bảo.

## 8. Accessibility & responsive

- Tooltip: `role="dialog"`, `aria-modal="false"` (không trap focus), `aria-labelledby`, `aria-describedby`, `aria-live="polite"` khi đổi step.
- Esc: coach mark → đóng ngay; tutorial chính → mở `SkipConfirmDialog`.
- Tab/Shift+Tab luân chuyển giữa Back/Next/Skip.
- Mobile <768px: bottom sheet full width, cách nút "Kết thúc quý" ≥ 80px; spotlight cuộn target vào giữa viewport bằng `scrollIntoView({block:"center"})` một lần khi step mở.
- `prefers-reduced-motion`: opacity thay animate translate.

## 9. Tests (Vitest)

`src/tutorial/*.test.ts(x)`:

- `storage.test.ts`: read/write round-trip, version bump bỏ dữ liệu cũ, SSR-safe (mock `window = undefined`).
- `state.test.ts`: start/next/previous, không quay lại quá 0, skip/complete set flag, restart clear.
- `observer.test.tsx`: mock `useGameStore`, giả lập queue có modal → overlay không render; queue trống + step chờ quarter-ended + history tăng → advance.
- `steps.test.ts`: step 6 chỉ complete khi `usedDecisionGroups.size` tăng; step 5 chấp nhận bất kỳ hover trong tab; step 8 chỉ render sau khi summary được dismiss.
- `hints.test.ts`: mỗi hint chỉ trigger 1 lần; không trigger khi modal mở.
- Integration nhẹ: render `<GameScreen />` với state mới → overlay xuất hiện; sau `reset()` không xóa completed flag.

Không sửa `simulation.test.ts`, `concepts.test.ts`, `state.test.ts` (game state) hay 15 concept trigger.

## 10. Production gate

Sau khi implement: `bunx vitest run`, `bunx tsgo --noEmit`, ESLint, build. Playwright smoke: viewport 1440×900 và 360×800, chạy toàn tutorial + reset không mở lại + restart mở lại + Eureka giữa tutorial pause đúng.

## Ghi chú kỹ thuật (không cần với user)

- Không đưa refs của gameplay vào tutorial store; dùng `document.querySelector('[data-tutorial="..."]')` với `useLayoutEffect` + `ResizeObserver` để tự cập nhật spotlight khi layout đổi.
- Overlay mount ở cuối `<GameScreen>` cùng cấp modal để nằm dưới `EventModal`/`ConceptModal` khi cần (z-index thấp hơn 50 của Radix Dialog nhưng cao hơn dashboard: dùng `z-40`).
- Không đụng `state.ts`, `decisions.ts`, `engine/*`, `concepts.ts`, `balance.ts`.

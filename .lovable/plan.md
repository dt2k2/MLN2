# Prototype "Ca học việc" — /apprenticeship

Minigame khởi động dạy trực giác 10 khái niệm Marx nền tảng, hoàn toàn tách biệt khỏi engine/store chính. Giai đoạn này chỉ dựng UI + state cục bộ.

## Phạm vi

**Sẽ làm**

- Route mới `/apprenticeship` (file-based routing tạo route tự động).
- 6 round tương tác theo state machine `brief → interact → simulate → eureka → check → complete`.
- State cục bộ (`useReducer`) trong component, deterministic — không random.
- Unit test số liệu round 2/3/4/6.
- Dev-only round switch (chỉ hiện khi `import.meta.env.DEV`).

**KHÔNG làm**

- Không import `useGameStore`, `computeQuarter`, `laws.ts`, `pressures.ts`, `decisions.ts`.
- Không sửa `intro.tsx`, `index.tsx`, `game.tsx`, `concepts.ts`, `tutorial/*`, `codex-panel.tsx`.
- Không lưu localStorage, không routing vào `/game` từ đây.
- Không sửa tay `routeTree.gen.ts` (plugin tự regen).
- Không thêm asset ảnh mới — chỉ dùng ảnh đã có trong `src/assets/heinrich/` khi cần tín hiệu thị giác nhẹ.

## Cấu trúc file

```
src/routes/apprenticeship.tsx           # route shell + header + progress + round switch
src/apprenticeship/
  types.ts                              # RoundId, Phase, RoundState, ConceptId (10 concept minigame)
  state.ts                              # reducer + initial state + selectors
  content.ts                            # copy Vietnamese: brief, câu hỏi check, tên khái niệm hiển thị sau eureka
  numbers.ts                            # hằng số round 2/3/4/6 (nguồn cho test)
  numbers.test.ts                       # unit test số liệu deterministic
  components/
    RoundHeader.tsx                     # 56–64px header + progress 6 nút tròn
    TaskPanel.tsx                       # panel phải: tiêu đề + ≤3 câu hướng dẫn + control + nút hành động
    EurekaPanel.tsx                     # crossfade cùng vị trí TaskPanel; aria-live polite
    ResultTray.tsx                      # khay kết quả dưới sân khấu
    CheckQuestion.tsx                   # câu kiểm tra ngắn; sai → giải thích + retry, không trừ điểm
    Stage.tsx                           # khung cố định 65–70% width cho sân khấu round
  rounds/
    Round1Commodity.tsx                 # Xưởng → Tấm vải → Thị trường (drag + nút "Đưa ra trao đổi")
    Round2Value.tsx                     # phân loại c/v vs giá trị mới → c=50 v=30 m=30 total=110
    Round3Absolute.tsx                  # slider 8→10h; m 40→60; m′ 100→150%
    Round4Machine.tsx                   # 8→12 đvsp; giờ/đv 1→0.67; đối thủ áp máy → tất yếu 4→3.5
    Round5Overproduction.tsx            # chọn 80/100/140; cầu sụt còn 70; so sánh giá trị/bán/doanh thu/tồn
    Round6Accumulation.tsx              # slider giữ lại + nút "Mua máy" khi ≥ $30
  hooks/
    useReducedMotion.ts                 # wrapper matchMedia prefers-reduced-motion
    useFocusPhaseHeading.ts             # chuyển focus về tiêu đề phase mới
```

## Bố cục desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Header 56–64px: Ca học việc · Round n/6 · [Thoát]            │
├──────────────────────────────────────────────────────────────┤
│ Progress: (1)─(2)─(3)─(4)─(5)─(6)   khóa=mờ, xong=✓           │
├─────────────────────────────────────┬────────────────────────┤
│                                     │                        │
│         Stage (65–70%)              │   TaskPanel (30–35%)   │
│         Sân khấu round              │   ⇄ EurekaPanel        │
│                                     │   (crossfade cùng slot)│
│                                     │                        │
├─────────────────────────────────────┤                        │
│ ResultTray (chỉ hiện sau simulate)  │                        │
└─────────────────────────────────────┴────────────────────────┘
```

Kích thước Stage/TaskPanel cố định `min-h` để không nhảy layout giữa phase. Dưới breakpoint desktop → `<MobileWarning />` sẵn có.

## State machine

```ts
type Phase = 'brief' | 'interact' | 'simulate' | 'eureka' | 'check' | 'complete';
type RoundId = 1|2|3|4|5|6;
interface AppState {
  currentRound: RoundId;
  phase: Phase;
  unlockedUpTo: RoundId;         // gate progress
  rounds: Record<RoundId, { completed: boolean; attempts: number }>;
  // round-specific transient state được giữ trong component con qua useReducer riêng
}
```

Action: `NEXT_PHASE`, `RESET_ROUND`, `COMPLETE_ROUND`, `GOTO_ROUND` (dev-only enforce `unlockedUpTo`).

## Số liệu deterministic (nguồn `numbers.ts` + test)

- Round 2: `mat=40, dep=10, wage=30, living=60 → c=50, v=30, m=30, total=110`.
- Round 3: `h=8 → v=40,m=40,mRate=1.0`; `h=10 → v=40,m=60,mRate=1.5`.
- Round 4: `pre: 8h, 8u, 1h/u`; `post: 8h, 12u, 0.667h/u`; social norm 4h → 3.5h.
- Round 5: chọn output ∈ {80,100,140}, effectiveDemand=70 → `sold=min(output,70)`, `unsold=output-sold`, doanh thu và m tính theo bảng cố định.
- Round 6: profit=$40, machinePrice=$30; unlock khi `retained ≥ 30` **và** đã bấm "Mua máy".

## Giáo dục / accessibility

- Mỗi round: brief chưa gọi tên khái niệm → interact → simulate animation dòng giá trị → EurekaPanel gọi tên → CheckQuestion; sai → giải thích + retry, không trừ điểm, không mở round tiếp.
- Drag luôn có nút click + phím tương đương (Enter/Space).
- `aria-live="polite"` trên ResultTray và EurekaPanel.
- `prefers-reduced-motion` → bỏ animation, chuyển state tức thời.
- Focus tự chuyển về `<h2>` của phase mới.
- Card `rounded-lg` (≤8px), không gradient orb, không hero marketing, không SVG trang trí.

## Màn kết thúc

Grid 15 ô: 10 concept minigame hiện tên + icon; 5 concept nâng cao của game chính hiện ô tối `?` (không tiết lộ tên, không import từ `concepts.ts`).

## Kiểm thử & nghiệm thu

- `numbers.test.ts`: assert số của round 2/3/4/6.
- `state.test.ts`: sai CheckQuestion không tăng `unlockedUpTo`; Reset đưa round về `brief`.
- Grep guard trong test: `apprenticeship/**` không được import `useGameStore` / `game/engine/*` / `game/state`.
- `bun run` typecheck + vitest + eslint + build.
- Screenshot Playwright 1280×720 và 1440×900 cho cả 6 round (dev round switch để nhảy nhanh).

## Bàn giao cho giai đoạn sau

Ghi rõ trong closing message: chưa wire vào menu/intro, chưa persist, chưa gọi Codex chính, chưa gate `/game`. Tất cả điểm tích hợp để lại là `onExit` (hiện chỉ `navigate({to:'/'})`) và `onFinish` (hiện chỉ set `complete` cục bộ).

&nbsp;

Điều chỉnh bắt buộc trước khi triển khai:

- Round 2 dùng ba nhóm: c chuyển dịch, v ứng mua sức lao động, lao động sống tạo newValue=v+m.

- Round 4 tách socialLaborTime 1→0.67 giờ/đv khỏi necessaryLaborTime 4→3.5 giờ; newValue giữ $80 trước/sau máy.

- Round 5 dùng bảng: unit c=4,v=3,m=3; output=100; demand shock=70; sold=70; inventory=30; revenue=700; produced m=300; accounting profit=0.

- Round 6 hiển thị retained/ownerConsumption/fund cho đủ bốn tỷ lệ; concept chỉ mở sau khi mua máy.

- Dev switch được bỏ khóa, production progress vẫn khóa.

- Dùng useReducedMotion từ Framer Motion.

- Reset phải reset cả transient state của round.

- Cho phép dùng intro-3-desk.jpg và intro-4-workers.jpg.

- Thêm unit test Round 5.

- Production gate dùng npm test, npx tsc --noEmit, npm run lint, npm run build.
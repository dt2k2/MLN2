# Cán cân lịch sử (Historical Scale) — thay ContradictionCard

## Ý tưởng
Thay khối "Áp lực xã hội / Mâu thuẫn cơ bản" hiện tại (một thanh máu số) bằng một **cán cân SVG động** — biểu tượng trạng thái lịch sử của xưởng. Cán cân nghiêng theo `tilt`, rung theo `instability`, rạn theo `crackLevel`, và có 5 trạng thái đặt tên: Ổn định · Tích lũy căng · Bóc lột nóng · Khủng hoảng · Rạn vỡ.

Vị trí: đúng ô hiện tại của `ContradictionCard` trong `src/routes/game.tsx` (dòng 335). Không đụng logic game (`src/game/*`), chỉ derive từ state hiện có.

## Phạm vi (frontend-only)
- **Tạo mới**: `src/components/game/historical-scale.tsx` — SVG cán cân + animation.
- **Tạo mới**: `src/game/pressures.ts` — pure functions derive `capitalPressure`, `laborPressure`, `marketPressure`, `tilt`, `instability`, `crackLevel`, `phase` từ `GameState`. Không mutate state.
- **Sửa**: `src/routes/game.tsx` — thay `<ContradictionCard .../>` bằng `<HistoricalScale state={state} />`. Giữ `ContradictionCard` file lại (không xóa) để có thể revert; hoặc xóa nếu bạn xác nhận.
- **Không đụng**: `src/game/engine/*`, `balance.ts`, `decisions.ts`, `types.ts`.

## Công thức derive (đọc-only)

```ts
capitalPressure =
  clamp(debtRatio) * 30
  + inventoryRatio * 25
  + max(0, -profitRateReal) * 40
  + reinvestmentRate * 10           // 0..100+

laborPressure =
  contradiction * 0.5
  + unrest * 0.3
  + max(0, workHours - 10) * 8
  + socialUnemployment * 1.2
  + max(0, 1 - wageIndex) * 25

marketPressure =
  min(1, inventory/max(1,demand)) * 35
  + max(0, industrySupply/effectiveDemand - 1) * 30

tilt         = clamp(capitalPressure - laborPressure, -60, 60)   // độ nghiêng (deg/2)
instability  = clamp(capitalPressure + laborPressure + marketPressure, 0, 200)
crackLevel   = smoothstep(60, 120, instability + max(0, contradiction - 60))
phase        = 'stable' | 'accumulation' | 'exploitation' | 'crisis' | 'rupture'
```

Phase chọn theo ngưỡng ưu tiên: `rupture` nếu `contradiction≥85 || crackLevel≥0.8`; `crisis` nếu `marketPressure≥45 || overstockStreak≥2`; `exploitation` nếu `laborPressure≥55 || m/v>1`; `accumulation` nếu `capitalPressure≥45`; còn lại `stable`.

## Thiết kế thị giác (SVG, motion)

```text
     ╔══════════════ Cán cân lịch sử ══════════════╗
     ║   [phase badge]         [instability dots]  ║
     ║                                              ║
     ║           ╱‾‾‾‾‾‾●‾‾‾‾‾‾╲   ← beam (rotate: tilt°)
     ║          ▢ Tư bản    Lao động ▢               (đĩa trái/phải, y = -tilt)
     ║          ║             ║                    ║ (dây, có thể "chain" khi debt cao)
     ║           ║  ▲ trục ║   ← có vết nứt khi crackLevel cao
     ║          ▬▬▬▬▬▬▬▬▬▬▬                        ║
     ║  Tư bản 62 · Lao động 41 · Thị trường 18    ║ (mini bars)
     ╚══════════════════════════════════════════════╝
```

- **Beam** (thanh ngang): `motion.g` xoay `rotate: tilt * 0.6` với `transition spring stiffness 60`.
- **Đĩa trái = Tư bản**: chồng biểu tượng theo trọng số — coin stack (cash/debt), gear (machines), chain (khi debt>0). Đĩa **phải = Lao động**: figure silhouettes (workers), nhịp thở theo health.
- **Rung** (instability): `animate x/y` bằng noise ±(instability/50)px, loop. Trên `>120` chuyển sang red-shift filter.
- **Vết nứt trục** (crackLevel): SVG `<path>` zig-zag opacity = crackLevel; xuất hiện dần, không biến mất khi giảm nhẹ (hysteresis 0.15) — kể chuyện tổn thương lâu dài.
- **Overstock**: khi marketPressure cao, thêm cuộn vải rơi khỏi đĩa Tư bản (motion `y: [0, 40]`, opacity fade), nền đĩa hơi lạnh.
- **Tiền cách mạng** (`rupture`): nền tối lại, đĩa lao động phát sáng mờ (`filter: drop-shadow`), silhouette đám đông tĩnh phía sau.

Palette dùng token có sẵn: `--gold` (tư bản), `--contradiction` (lao động), `--danger` (rạn), `--muted-foreground`, `--panel-elevated`. Không hardcode màu.

## Preview khi hover option (tuỳ chọn giai đoạn 2)
`ActionPreview` có sẵn `produce(state, DECISIONS[id].apply)`. Ở giai đoạn 2, expose `useHoverAction` để `HistoricalScale` nhận `previewState?` và animate tilt/instability tạm thời. **Không** làm ở giai đoạn 1 để giữ scope nhỏ; đánh dấu TODO.

## Tooltip & Eureka
- Hover cả khối → `StatTooltip conceptKey="capitalistContradiction"` (giữ nguyên concept đã có).
- Lần đầu `crackLevel` vượt 0.5 → gọi `discoverConcept('capitalistContradiction')` nếu chưa unlock + `showWarning("Cán cân bắt đầu rạn — mâu thuẫn cơ bản CNTB")`. Dùng đúng API hiện có, không tạo concept mới.
- Không hiển thị chữ giải thích dài. Chỉ tên phase + 3 số nhỏ.

## Chi tiết kỹ thuật

**File `src/game/pressures.ts`** (pure, có thể unit-test sau):
```ts
export type ScalePhase = 'stable'|'accumulation'|'exploitation'|'crisis'|'rupture';
export interface ScaleReading {
  capital: number; labor: number; market: number;
  tilt: number; instability: number; crackLevel: number;
  phase: ScalePhase; phaseLabel: string;
}
export function readScale(s: GameState): ScaleReading { ... }
```

**File `src/components/game/historical-scale.tsx`**:
- Props: `{ state: GameState }`.
- Nội bộ: `const r = readScale(state)`; useRef cho `crackLevel` hysteresis; `useEffect` phát Eureka.
- SVG viewBox `0 0 200 140`, responsive `w-full h-[140px]`.
- Motion: `framer-motion` (đã có).
- A11y: `role="img" aria-label={\`Cán cân: ${r.phaseLabel}, tư bản ${...}, lao động ${...}\`}`.

**Sửa `game.tsx`** — chỉ 2 dòng:
- Bỏ `import { ContradictionCard } ...`, thêm `import { HistoricalScale } ...`.
- Thay `<ContradictionCard value={contradictionInt} unrest={state.unrest} />` bằng `<HistoricalScale state={state} />`.

## Không làm
- Không đổi balance/công thức kinh tế.
- Không thêm âm thanh (bạn chưa yêu cầu file audio; có thể bổ sung sau nếu muốn).
- Không xoá `ContradictionCard.tsx` (giữ để rollback); nếu muốn xoá, nói với mình.

## Deliverable
1. `src/game/pressures.ts` (mới)
2. `src/components/game/historical-scale.tsx` (mới, SVG + motion)
3. `src/routes/game.tsx` (đổi 2 dòng)

Bạn duyệt là mình build.

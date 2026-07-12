
# Tối ưu UI/UX màn `/game`

Chỉ chạm lớp presentation (`src/routes/game.tsx`, các component trong `src/components/game/`, `src/styles.css`). Không đổi engine, decisions logic, hay công thức.

## Vấn đề hiện tại

1. **Header chồng chữ**: `HeaderStat` label `"Dư nợ · lãi tới · nợ/tài sản"` và giá trị `$X · $Y · Z%` bị wrap lộn xộn ở màn hình vừa; label + value đứng cùng cột hẹp gây tràn.
2. **6 nhóm quyết định** hiển thị đầy đủ ở cột phải hẹp (col-span-3) — mỗi nhóm là card riêng, tổng 6 card + nút "Kết thúc quý" vượt viewport, phải scroll dài; label "Đã dùng" và icon tranh chỗ với title.
3. **Dashboard 4 stat card** dùng `symbol` dài ("m = giá trị mới − v", "p′ = m/(c+v)") tràn ra khỏi card khi width < 300px.
4. **MarketCard 6 ô** trên 1 hàng lg:grid-cols-6 → label 2 dòng bị cắt chữ, giá trị mono lớn đè lên unit.
5. **Nhật ký · Codex**: hàng chip 15 concept + title trên cùng 1 flex, mobile bị wrap đè nút.
6. **DEV panel** cố định bottom-right đè lên Codex FAB và nội dung log.
7. **ContradictionCard** + ProfitChart + Capital ratio nhồi 3 cột md nhưng ở lg vẫn 3 cột → chart p′ quá dẹt.

## Thay đổi

### 1. `game-header.tsx` — tách nợ thành 3 stat riêng
- Thay 1 `HeaderStat` "Dư nợ · lãi tới · nợ/tài sản" bằng 3 stat riêng: **Dư nợ**, **Lãi quý tới**, **Nợ / Tài sản** (ẩn 2 cái sau khi `debt === 0` để giảm chật).
- Grid header: `sm:grid-cols-3 lg:flex` với `flex-wrap`; mỗi stat có `min-w-0` + `truncate` cho value, `whitespace-nowrap` cho label ngắn.
- Rút gọn label: "Xí nghiệp" → "Hãng", "Tư bản tiền tệ" → "Tiền mặt", "Dư nợ · lãi tới · nợ/tài sản" → 3 label ngắn.
- Ẩn logo "DAS KAPITALIST" ở màn < md, chỉ giữ gear icon để nhường chỗ.

### 2. `routes/game.tsx` — cột phải: gộp Decision groups
- Đổi từ **6 card dọc** → **1 accordion / segmented**: dùng shadcn `Tabs` (đã có) với 6 tab icon-only ở đầu, panel bên dưới hiện options của nhóm được chọn (2 nút lớn). Chiều cao cố định → không cần scroll.
- Header nhỏ trên tabs: `SectionTitle` "Quyết định — {quarter}" + counter `{used}/3 nhóm` bên phải.
- Nhóm đã dùng: tab hiển thị badge chấm gold + disabled; nhóm bị khoá do đạt trần 3 → tab dimmed nhưng vẫn xem được preview.
- Panel option: 2 button chiếm full width, mỗi button gồm label bold + 1 dòng description muted; `ActionPreview` render ngay dưới (không cần hover) — luôn thấy Δ trước khi bấm.
- `EndTurnButton` giữ dưới đáy cột, sticky `lg:sticky lg:bottom-0`.

### 3. Dashboard 4 stat (c/v/m/p′)
- `DashboardCard` prop `symbol`: giới hạn `truncate` + `text-xs`; công thức dài chuyển vào tooltip, chỉ hiện ký hiệu ngắn ("m", "p′") trên card.
- Grid: `grid-cols-2 xl:grid-cols-4` (bỏ sm:grid-cols-4) để tránh chật ở màn 1024–1280.

### 4. Khu chart giữa
- Đổi grid `md:grid-cols-3` → `lg:grid-cols-[1.4fr_1fr_1fr]`: ProfitChart rộng hơn (chính), Capital ratio + Contradiction hẹp hơn.
- Capital ratio: bỏ legend 3 dòng dày, gộp thành 1 dòng inline nhỏ với dot color.

### 5. Market strip
- Đổi `lg:grid-cols-6` → `lg:grid-cols-3 xl:grid-cols-6` để label không bị cắt.
- `MarketCard`: label uppercase `text-[10px]` giới hạn 1 dòng + `truncate` + `title={label}`, value `text-xl` (giảm từ 2xl) — value + unit trên cùng dòng baseline không đè.

### 6. Log · Codex
- Tách thành 2 khối trong cùng panel: hàng đầu là title `Nhật ký`, hàng thứ 2 (border-top) là dải chip 15 concept scroll ngang `overflow-x-auto` với `flex-nowrap`. Không còn flex-wrap chip đè title.
- Chip disabled: giữ opacity 35 nhưng thêm `cursor-help` + tooltip "Chưa khám phá".

### 7. DEV panel + FAB
- DEV panel: chuyển thành popover mở từ nút nhỏ `⚙` ở góc, mặc định thu gọn — không đè Codex FAB.
- Codex FAB: đổi `bottom-4 right-4` → `bottom-4 left-4` để tách khỏi DEV.

### 8. `styles.css`
- Thêm utility `.panel-tight { @apply rounded-lg p-3; }` để dùng thống nhất, giảm padding trong các card mật độ cao.
- Utility `.stat-value-clip` cho value mono truncate không bị nhảy layout.

## Không đổi

- Không đổi bất kỳ file nào trong `src/game/*`.
- Không đổi luồng presentation queue, modal, ending.
- Không đổi cơ chế 3 nhóm/quý, chỉ đổi cách trình bày lựa chọn.

## Verify

- `tsgo` typecheck.
- Playwright: mở `/game`, screenshot ở viewports 1280×800 và 1440×900, kiểm tra không có text tràn/overlap ở header, decisions column, market strip.
- Click 1 tab decision → screenshot xác nhận `ActionPreview` render inline.

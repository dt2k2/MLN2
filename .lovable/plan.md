## Mục tiêu
1. Fix cursor: mọi option/tab/button trong khu decisions và tương tác chuyển thành `cursor-pointer`.
2. Thêm Intro Scene (~90s) với narration audio + 3 ảnh minh họa, có Skip, ghi nhớ đã xem.

---

## 1. Cursor cho các option

**File**: `src/routes/game.tsx`, `src/components/ui/tabs.tsx` (nếu cần), và các decision buttons.

- Rà toàn bộ `<button>`, `<TabsTrigger>`, các card decision, chips codex, close-modal — thêm `cursor-pointer` (và `cursor-not-allowed` khi disabled).
- Tập trung tại tabs 6 nhóm quyết định, 2 nút option lớn (Reduce/Extend, Raise/Cut...), EndTurnButton, DEV toggle, Codex FAB.

---

## 2. Intro Scene

### Kịch bản narration (tiếng Việt, ~90s, chia 4 beat)

**Beat 1 — Bối cảnh châu Âu (0-20s, ảnh: thành phố công nghiệp Rhineland đêm)**
> "Mùa xuân năm 1852. Bốn năm đã trôi qua kể từ khi những chiến lũy cách mạng 1848 sụp đổ trên khắp châu Âu. Ở vùng Rhineland của nước Phổ, khói than một lần nữa che kín bầu trời — nhưng lần này, không phải khói của súng đại bác, mà của những ống khói nhà máy."

**Beat 2 — Nhân vật (20-45s, ảnh: chân dung Heinrich trước xưởng dệt)**
> "Bạn là Heinrich Müller, ba mươi hai tuổi, vừa thừa kế xưởng dệt của cha mình bên bờ sông Wupper. Bốn mươi công nhân, tám cỗ máy dệt hơi nước, một cuốn sổ cái, và một khoản nợ chưa trả. Cha bạn đã dạy: 'Con ơi, tư bản không nghỉ ngơi.'"

**Beat 3 — Cuộc chơi (45-70s, ảnh: bàn giấy với sổ cái, đèn dầu, bản đồ ngành)**
> "Trước mặt bạn là hai mươi bốn quý — sáu năm — để biến xưởng này thành một đế chế, hay chứng kiến nó sụp đổ. Bauer ở phía nam vẫn dựa vào lao động rẻ. Krupp ở phía bắc đang mua máy mới mỗi tháng. Giá trị xã hội của mỗi thước vải đang giảm từng ngày, và bạn phải chạy — chỉ để đứng yên."

**Beat 4 — Câu hỏi mở (70-90s, ảnh: công nhân xếp hàng vào cổng xưởng lúc bình minh)**
> "Mỗi quyết định của bạn — kéo dài ngày lao động, hạ tiền lương, vay thêm tín dụng, hay tái đầu tư vào máy móc — sẽ vẽ nên số phận của bạn và của những con người đứng sau cánh cổng kia. Câu hỏi không phải là bạn sẽ thắng hay thua. Mà là: khi mọi chuyện kết thúc, bạn đã trở thành ai?"

### Assets sinh
- `src/assets/intro-1-city.jpg` — Rhineland đêm, khắc gỗ thế kỷ 19, tông ấm (imagegen fast)
- `src/assets/intro-2-heinrich.jpg` — Heinrich đứng trước xưởng dệt (imagegen fast)
- `src/assets/intro-3-desk.jpg` — bàn giấy sổ cái đèn dầu (imagegen fast)
- `src/assets/intro-4-workers.jpg` — công nhân xếp hàng cổng xưởng bình minh (imagegen fast)

### Audio narration
- Sinh sẵn 1 file MP3 bằng ElevenLabs (voice **Daniel** `onwK4e9ZLuTAKqWW03F9` — nam trầm kể chuyện, hoặc **George** `JBFqnCBsd6RMkjVDRZzb`) qua script `/tmp/lovable_ai.py` không dùng được cho ElevenLabs → sẽ dùng standard connector ElevenLabs.
- Yêu cầu link connector ElevenLabs; nếu user chưa link, code fallback: nếu file `/public/audio/intro-narration.mp3` tồn tại → dùng; nếu không → hiển thị intro với subtitle chạy theo timing manual, không có audio.
- File output: `public/audio/intro-narration.mp3` — user có thể ghi đè file này bất cứ lúc nào để thay giọng.
- Subtitle timings được hardcode theo 4 beat để đồng bộ ảnh + text (không phụ thuộc audio thật sự để đảm bảo intro luôn chạy đúng).

### Route & component
- Tạo `src/routes/intro.tsx` (full-screen scene).
- Layout: fullscreen, background ảnh với hiệu ứng Ken Burns (scale + pan chậm), overlay tối, subtitle ở dưới cuộn theo beat, progress bar mảnh trên đỉnh.
- Controls: nút **Skip** góc phải trên (`cursor-pointer`); nút **Bắt đầu** hiện ở beat cuối.
- Audio: `<audio autoplay>` gọi `/audio/intro-narration.mp3`; nếu load lỗi hoặc file không tồn tại → im lặng, timeline vẫn chạy theo `setTimeout` cho từng beat.
- Sau khi Skip/kết thúc → set `localStorage.setItem('dk_intro_seen', '1')` → navigate `/game`.

### Menu wiring
- `src/routes/index.tsx`: nút "Ván mới":
  - Nếu `localStorage.getItem('dk_intro_seen') !== '1'` → navigate `/intro`.
  - Nếu đã xem → navigate `/game` như hiện tại.
  - Thêm nút phụ nhỏ **"Xem lại intro"** trong menu (hoặc trong `/how-to-play`) để chạy lại chủ động.
- Gọi `reset()` khi bắt đầu ván mới (giữ như hiện tại), gọi trước khi chuyển đến intro.

### Files sẽ tạo/sửa
- **Tạo**: `src/routes/intro.tsx`, 4 assets ảnh, `public/audio/intro-narration.mp3` (nếu link được ElevenLabs).
- **Sửa**: `src/routes/index.tsx` (routing logic + nút xem lại), `src/routes/game.tsx` (cursor pointer), `src/routes/__root.tsx` (head metadata cho intro nếu cần).
- **Không đụng**: `src/game/*` (engine, decisions, balance, tick).

### Technical notes
- ElevenLabs: nếu connector đã có → dùng script Python gọi trực tiếp `api.elevenlabs.io/v1/text-to-speech/{voiceId}` với `ELEVENLABS_API_KEY`, model `eleven_multilingual_v2` (hỗ trợ tiếng Việt tốt), lưu MP3 vào `public/audio/`. Nếu chưa link → hỏi user link, hoặc build intro không audio + hướng dẫn user drop file vào `public/audio/intro-narration.mp3`.
- Ken Burns dùng CSS keyframe (scale 1 → 1.1, translate nhẹ) — không cần thư viện.
- Ảnh preload trước khi bắt đầu để tránh nhấp nháy.

---

## Câu hỏi cần chốt trước khi build
- Bạn muốn tôi link connector ElevenLabs để sinh file MP3 tự động, hay bạn tự upload `public/audio/intro-narration.mp3` sau?

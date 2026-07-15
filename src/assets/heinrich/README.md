# Hướng dẫn sản xuất media cho Hero Heinrich

Tài liệu này là nguồn thông tin duy nhất cho motion poster, video, nhạc nền và hiệu ứng
âm thanh của Hero Heinrich trong Production Stage 1.

## Tổng quan asset

Cấu hình tối thiểu để Hero hoạt động hoàn chỉnh:

- **2 ảnh WebP 2.5D bắt buộc**: phòng trống và Heinrich tách nền.
- **4 bài nhạc nền MP3** tương ứng với 4 phase lịch sử.
- **3 ambience loop + 4 stinger MP3** phản ứng với tình trạng của xưởng.
- Stage 1 chưa có lồng tiếng Heinrich.

**7 video MP4 là gói nâng cấp tùy chọn**, không còn là điều kiện để đưa game lên production.
Nếu có video đúng tên, Hero tự phát video khi tải xong. Khi video thiếu, đang tải hoặc lỗi,
motion poster 2.5D vẫn tiếp tục hiển thị. Nếu cả hai lớp 2.5D lỗi, ảnh intro gốc là fallback
cuối cùng. Video luôn không có audio nhúng; mọi âm thanh được quản lý bằng asset riêng.

## Bộ motion poster 2.5D bắt buộc

Hai file sau phải có cùng kích thước `960x540` và khớp tọa độ tuyệt đối:

| Tên file               | Nội dung                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| `heinrich-room.webp`   | Căn phòng/xưởng đã xóa Heinrich, giữ nguyên camera, máy móc và ánh sáng. |
| `heinrich-cutout.webp` | Heinrich cùng sổ cái trên nền alpha trong suốt, đúng vị trí ảnh gốc.     |

Thứ tự lớp trong component: phòng → ánh sáng/khói → bóng công nhân → Heinrich → giấy và
vignette. Chuyển động 2.5D được tạo bằng Framer Motion, theo đúng `HeroCondition` và không
dùng randomness trong render.

Yêu cầu nghiệm thu hai lớp:

- Khuôn mặt, tóc, râu, trang phục, sổ cái và tỷ lệ của Heinrich phải nhất quán với ảnh intro.
- Không còn viền khóa màu quanh tóc, râu, tay hoặc áo khoác.
- Khi chồng hai lớp ở tọa độ `0,0`, bố cục phải khớp và không tạo bóng người kép.
- Các vùng được inpaint phải tiếp tục hợp lý khi background drift hoặc subject thở nhẹ.
- `prefers-reduced-motion` phải cho ảnh phân lớp tĩnh, không có parallax, rung, khói hoặc giấy.

## Hình ảnh tham chiếu

Hai lớp 2.5D và mọi video tùy chọn phải dùng đúng Heinrich trong `../intro-2-heinrich.jpg`:

- Giữ nguyên khuôn mặt, tuổi, tóc, râu và áo khoác đen.
- Giữ cùng phòng làm việc, kiến trúc xưởng và góc camera.
- Không thay đổi phong cách hiện thực giữa các clip.
- Heinrich nằm trong vùng an toàn trung tâm 60% khung hình để không bị crop trên
  desktop hoặc mobile.

## Bảy video Hero tùy chọn

Vite tự động tìm MP4 trong thư mục này. Có thể bổ sung từng clip một, chỉ cần đặt đúng tên
file mà không sửa component. Clip chỉ phủ lên motion poster sau sự kiện `canplay`, vì vậy
không có khung trống trong lúc tải.

| Tên file                | Trạng thái    | Yêu cầu cảnh và chuyển động                                                                                    |
| ----------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| `01-neutral.mp4`        | Điềm tĩnh     | Heinrich đọc sổ cái, chớp mắt và thở nhẹ; máy chạy đều; ánh sáng vàng trung tính.                              |
| `02-expansion.mp4`      | Tham vọng     | Xem bản vẽ máy hoặc số liệu tăng trưởng rồi ngẩng đầu; ánh lò sáng hơn; tự tin nhưng không cười phản diện.     |
| `03-hardline.mp4`       | Cứng rắn      | Hàm và vai căng, nhìn đồng hồ hoặc phía xưởng; máy chạy nhanh, ánh sáng gắt; không có hành vi bạo lực.         |
| `04-market-crisis.mp4`  | Lo âu         | Nhìn sổ lỗ hoặc kho đầy, chống tay suy nghĩ; ánh sáng lạnh, máy chậm; không diễn quá bi kịch.                  |
| `05-labor-conflict.mp4` | Bị thách thức | Heinrich quan sát bóng công nhân tập trung ngoài cửa kính; không khí căng nhưng không mô tả bạo lực trực tiếp. |
| `06-rupture.mp4`        | Mất kiểm soát | Giấy bay, khói dày, ánh đỏ chập chờn; Heinrich mất bình tĩnh; không rung camera hoặc cắt cảnh.                 |
| `07-dominant.mp4`       | Đắc thế       | Đứng thẳng, xem sổ sách tích cực, xưởng hoạt động mạnh; tự tin có tiết chế, không tạo hình “vua tư bản”.       |

### Quy chuẩn video chung

- Độ phân giải `960x540`, tỷ lệ 16:9, 24fps.
- Độ dài 4-6 giây, loop kín; khung hình đầu và cuối gần như giống nhau.
- H.264 MP4 với pixel format `yuv420p`.
- Dung lượng mục tiêu 0,8-1,5MB mỗi file; tổng 7 file dưới khoảng 10MB.
- Camera cố định, không zoom, pan, rung hoặc đổi góc quay.
- Không chữ, UI, logo, phụ đề, âm thanh, fade-to-black hoặc chuyển cảnh.
- Chuyển động nhỏ và liên tục, đủ để vòng lặp không có cảm giác đứng hình.
- Kiểm tra lại bằng `object-fit: cover` ở cả desktop và mobile trước khi nghiệm thu.

## Chiến lược nhạc nền

Game dùng **4 bài theo phase**, không dùng một bài mỗi quý và không đổi cả bài
theo từng biểu cảm. Cách này giữ được mạch lịch sử và tránh nhạc bị cắt liên tục
khi `HeroCondition` thay đổi sau một quyết định.

| Tên file                |  Lượt | Màu nhạc                                                                               | Từ khóa tìm trên YouTube                                                       |
| ----------------------- | ----: | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `01-reconstruction.mp3` |   1-6 | Chamber music lịch sử, cello/harmonium nhẹ, 60-72 BPM; bình tĩnh nhưng còn dư âm 1848. | `industrial revolution historical documentary calm chamber music royalty free` |
| `02-accumulation.mp3`   |  7-12 | Ostinato cơ khí, dây và bộ gõ tiết chế, 72-84 BPM; tích lũy và tham vọng.              | `mechanical orchestral ostinato industrial documentary royalty free`           |
| `03-competition.mp3`    | 13-18 | Dây trầm, nhịp máy rõ hơn, bất hòa vừa phải, 78-92 BPM; cạnh tranh và xung đột.        | `tense chamber strings industrial suspense no copyright`                       |
| `04-crisis-1857.mp3`    | 19-24 | Cello/piano thưa, bass drone, 55-70 BPM; tín dụng co lại và khủng hoảng 1857.          | `dark cello piano economic crisis documentary royalty free`                    |

### Quy chuẩn và quy tắc phát nhạc

- Track dài 90-180 giây và có điểm loop sạch.
- Không lời, không trống điện tử, synth hiện đại hoặc âm thanh mang chất trailer
  quá mạnh.
- Chỉ đổi track khi bắt đầu lượt 7, 13 và 19.
- Crossfade giữa hai phase trong 2,5 giây; không dừng và phát lại đột ngột.
- Mức nhạc nền mục tiêu là 20-25% âm lượng master.
- Không tự phát audio trước tương tác đầu tiên của người dùng.

## Ambience và stinger

Ambience tạo cảm giác xưởng đang hoạt động. Stinger là điểm nhấn ngắn, chỉ phát
khi condition thực sự chuyển trạng thái.

| Tên file                     | Công dụng                                                                   |
| ---------------------------- | --------------------------------------------------------------------------- |
| `factory-steady.mp3`         | Tiếng máy dệt và hơi nước ổn định cho `neutral`, `expansion` và `dominant`. |
| `factory-strained.mp3`       | Máy nhanh và kim loại căng cho `hardline` hoặc khi áp lực lao động cao.     |
| `crowd-distant.mp3`          | Đám đông ở xa, dùng nhẹ cho `labor-conflict` và `rupture`.                  |
| `stinger-expansion.mp3`      | Điểm nhấn ngắn khi lần đầu chuyển sang `expansion` hoặc `dominant`.         |
| `stinger-market-crisis.mp3`  | Âm trầm ngắn khi bước vào `market-crisis`.                                  |
| `stinger-labor-conflict.mp3` | Nhịp căng ngắn khi xung đột lao động xuất hiện.                             |
| `stinger-rupture.mp3`        | Điểm gãy mạnh nhưng không mang phong cách kinh dị.                          |

### Từ khóa tìm hiệu ứng âm thanh

- `victorian factory ambience steam engine loom loop`
- `industrial machinery strained metal loop`
- `distant workers crowd protest ambience`
- `dark orchestral tension stinger`
- `industrial crisis cinematic hit`

### Quy tắc phát ambience và stinger

- Ambience crossfade khoảng 1 giây khi condition thay đổi.
- Stinger chỉ phát khi vừa bước vào condition, không phát lại mỗi render hoặc mỗi
  quý nếu condition không đổi.
- `neutral` không cần stinger.
- `dominant` dùng chung `stinger-expansion.mp3`; `hardline` dùng
  `factory-strained.mp3` thay vì một bài nhạc riêng.
- Khi có narration, nhạc và ambience giảm khoảng 8dB, sau đó tăng lại từ từ.

## Nguồn nhạc và giấy phép

Ưu tiên tìm trong
[YouTube Studio Audio Library](https://support.google.com/youtube/answer/3376882)
bằng bộ lọc genre, mood, duration và `Attribution not required`.

Lưu ý bắt buộc:

- Dòng chữ “no copyright” trong tiêu đề video YouTube không phải bằng chứng giấy
  phép.
- YouTube chỉ xác nhận asset trong Audio Library là copyright-safe trên nền tảng
  của họ. Webgame cần giấy phép cho phép phân phối trong website hoặc ứng dụng
  tương tác.
- YouTube được dùng để tìm mood tham khảo. Không đưa file vào production nếu
  không có điều khoản sử dụng rõ ràng.
- Nếu asset yêu cầu attribution, sao chép nguyên văn nội dung ghi công vào tài
  liệu credit của game.

Với mỗi asset đã chọn, lưu lại bằng chứng:

| Trường                | Nội dung cần lưu                                                    |
| --------------------- | ------------------------------------------------------------------- |
| URL nguồn             | Trang tải chính thức, không chỉ là URL re-upload.                   |
| Tác giả               | Tên tác giả hoặc nhà phát hành.                                     |
| Ngày tải              | Ngày file được đưa vào dự án.                                       |
| Loại giấy phép        | CC0, CC-BY, YouTube Audio Library hoặc giấy phép thương mại cụ thể. |
| Attribution           | Nguyên văn credit nếu giấy phép yêu cầu.                            |
| Quyền dùng trong game | Xác nhận cho phép phân phối trên web/app và loop/chỉnh âm lượng.    |

## Checklist nghiệm thu

### Motion poster

- [x] Có `heinrich-room.webp` và `heinrich-cutout.webp`, cùng kích thước `960x540`.
- [x] Hai lớp khớp tọa độ, không đổi khuôn mặt hoặc tỷ lệ nhân vật.
- [ ] Kiểm tra đủ 7 màu trạng thái ở desktop, ultrawide và mobile.
- [ ] Reduced motion hiển thị poster tĩnh, không còn parallax, khói, rung hoặc particle.
- [ ] Xóa hoặc đổi tên một lớp để xác nhận fallback ảnh intro không tạo khung trắng.

### Video tùy chọn

- [ ] Các MP4 đã có dùng đúng tên và mapping `HeroCondition`; không bắt buộc đủ cả 7.
- [ ] Heinrich nhất quán với ảnh intro trong cả 7 clip.
- [ ] Loop không giật, không đổi ánh sáng đột ngột ở điểm nối.
- [ ] Không có audio track nhúng trong MP4.
- [ ] Crop an toàn ở desktop và mobile; motion poster vẫn hiện khi video thiếu hoặc lỗi.
- [ ] Mỗi file nằm trong giới hạn dung lượng.

### Audio

- [ ] Đủ 4 phase track, 3 ambience và 4 stinger.
- [ ] Track không lời, đúng màu lịch sử và không có âm thanh hiện đại lạc tông.
- [ ] Loop không có khoảng lặng hoặc tiếng click ở điểm nối.
- [ ] Crossfade phase, ambience và stinger không che nội dung giáo dục.
- [ ] Mute và master volume hoạt động; không autoplay trước tương tác.
- [ ] Đã lưu URL, tác giả, ngày tải, giấy phép và attribution.

## Cấu trúc thư mục đề xuất

```text
src/assets/heinrich/
  heinrich-room.webp          # bắt buộc
  heinrich-cutout.webp        # bắt buộc
  01-neutral.mp4              # tùy chọn
  02-expansion.mp4            # tùy chọn
  03-hardline.mp4             # tùy chọn
  04-market-crisis.mp4        # tùy chọn
  05-labor-conflict.mp4       # tùy chọn
  06-rupture.mp4              # tùy chọn
  07-dominant.mp4             # tùy chọn
  README.md

public/audio/game/
  music/
    01-reconstruction.mp3
    02-accumulation.mp3
    03-competition.mp3
    04-crisis-1857.mp3
  ambience/
    factory-steady.mp3
    factory-strained.mp3
    crowd-distant.mp3
  stingers/
    stinger-expansion.mp3
    stinger-market-crisis.mp3
    stinger-labor-conflict.mp3
    stinger-rupture.mp3
```

Audio manager và logic phát nhạc sẽ được triển khai trong một đợt riêng sau khi
các asset đạt checklist nghiệm thu trên.

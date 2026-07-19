# Kế hoạch âm thanh cho Das Kapitalist

## Nguyên tắc

- Nhạc nền tạo bối cảnh dài; hiệu ứng âm thanh chỉ xác nhận hành động hoặc báo một biến cố quan trọng.
- Không phát âm thanh cho mọi cú nhấp. Các tab, tooltip và thao tác đọc dashboard nên im lặng.
- Không đổi nhạc mỗi quý hoặc theo từng biểu cảm của Heinrich. Việc đổi liên tục gây mệt và làm mất nhịp thuyết trình.
- Video Hero không nhúng audio. Nhạc, ambience và stinger là các asset riêng để người chơi có thể chỉnh âm lượng.
- Mọi âm thanh chỉ bắt đầu sau tương tác đầu tiên; luôn có nút tắt nhạc và hiệu ứng riêng.

## Bộ SFX tối thiểu

| File đề xuất           | Khi phát                            | Tính chất                                                     | Từ khóa tìm kiếm                                                       |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `decision-select.mp3`  | Quyết định được áp dụng thành công  | Tiếng đóng dấu hoặc gạt cần cơ khí ngắn, chắc, không quá nặng | `soft mechanical lever click sound effect`, `ledger stamp soft sound`  |
| `decision-undo.mp3`    | Hoàn tác để chọn lại                | Tiếng giấy trượt hoặc cơ cấu trả nhẹ                          | `paper slide back sound effect`, `mechanical switch reverse soft`      |
| `quarter-complete.mp3` | Kết thúc một quý                    | Chuông xưởng nhỏ kết hợp tiếng đóng sổ                        | `victorian factory bell short`, `ledger book close sound effect`       |
| `round-success.mp3`    | Qua một ải Ca học việc              | Chime ấm 0,5-1 giây, tạo cảm giác hiểu ra                     | `warm discovery chime short`, `educational correct answer subtle`      |
| `round-retry.mp3`      | Trả lời chưa đúng trong Ca học việc | Tiếng gõ gỗ nhẹ, không mang cảm giác trừng phạt               | `soft wood knock ui`, `gentle incorrect answer sound`                  |
| `concept-unlock.mp3`   | Mở khóa khái niệm mới               | Giấy, máy in và một nốt sáng ngắn                             | `printing press page reveal chime`, `journal unlock sound effect`      |
| `event-alert.mp3`      | Event mới xuất hiện                 | Chuông điện báo hoặc tiếng giấy báo đến                       | `telegraph bell notification`, `victorian newspaper alert sound`       |
| `achievement.mp3`      | Nhận thành tựu học thuật            | Brass/metal accent tiết chế, không giống game arcade          | `subtle orchestral achievement stinger`, `short brass documentary cue` |

Ưu tiên sản xuất sáu file đầu. `event-alert` và `achievement` có thể dùng chung một stinger trong bản demo nếu cần giảm khối lượng asset.

## Nhạc nền nên có

### Bắt buộc cho bản demo

1. `main-menu.mp3`: nhận diện chủ đề, trang trọng và ngắn gọn.
2. `prologue.mp3`: chậm, giàu không khí lịch sử, chừa khoảng cho lời dẫn.
3. `apprenticeship.mp3`: nhẹ và rõ nhịp hơn prologue, ít căng thẳng để người mới tập trung đọc.
4. `ingame.mp3`: nhịp cơ khí vừa phải, không lấn tiếng thuyết trình.

Từ khóa cho Ca học việc: `light industrial workshop chamber music royalty free`, `curious mechanical documentary music no vocals`.

### Nâng cấp sau demo

Thay một bài `ingame` bằng bốn biến thể theo phase, crossfade ở lượt 7, 13 và 19:

| Phase                 | Màu nhạc                                | Từ khóa tìm kiếm                                              |
| --------------------- | --------------------------------------- | ------------------------------------------------------------- |
| 1852-1853: Tái thiết  | Chamber/cello bình tĩnh, còn dư âm 1848 | `industrial revolution calm chamber documentary royalty free` |
| 1853-1854: Tích lũy   | Ostinato cơ khí, tham vọng tăng dần     | `mechanical orchestral ostinato documentary royalty free`     |
| 1855-1856: Cạnh tranh | Dây trầm, bất hòa vừa phải              | `tense chamber strings industrial suspense royalty free`      |
| 1857: Khủng hoảng     | Cello/piano thưa, bass drone            | `dark cello piano economic crisis documentary royalty free`   |

Ending không nhất thiết cần bài nhạc dài riêng trong Stage 1. Có thể giảm dần nhạc ingame rồi dùng một stinger 3-6 giây cho từng nhóm kết cục: cải cách/duy trì, phá sản/thâu tóm và cách mạng.

## Ambience phản ứng

Ba loop dưới đây tạo hiệu quả lớn hơn việc thêm nhiều bài nhạc:

| File                   | Trạng thái sử dụng                      | Từ khóa tìm kiếm                                     |
| ---------------------- | --------------------------------------- | ---------------------------------------------------- |
| `factory-steady.mp3`   | Xưởng bình thường, mở rộng hoặc đắc thế | `victorian textile factory ambience steam loom loop` |
| `factory-strained.mp3` | Giờ dài, máy chạy căng, áp lực cao      | `industrial machinery strained metal seamless loop`  |
| `crowd-distant.mp3`    | Xung đột lao động hoặc rạn nứt          | `distant workers crowd protest ambience loop`        |

Ambience để thấp hơn nhạc, crossfade khoảng một giây. Không phát tiếng đám đông liên tục chỉ vì chỉ số bất ổn tăng nhẹ.

## Mix và bản quyền

- Music: khoảng 20-25% master; ambience: 8-15%; SFX: 35-50%.
- Khi có narration, giảm music và ambience khoảng 8 dB.
- SFX ngắn nên ở định dạng MP3 hoặc OGG; loop cần kiểm tra khoảng lặng ở điểm nối.
- Ưu tiên [YouTube Studio Audio Library](https://support.google.com/youtube/answer/3376882) với bộ lọc `Attribution not required`. Cụm từ “no copyright” trong tiêu đề video không tự bảo đảm quyền phân phối trong webgame.
- Với mỗi asset, lưu URL nguồn, tác giả, ngày tải, loại giấy phép và nội dung attribution cạnh file bàn giao.

## Thứ tự triển khai

1. Sửa và nén ba track hiện có; thêm track Ca học việc.
2. Thêm `decision-select`, `decision-undo`, `quarter-complete`, `round-success`, `round-retry`, `concept-unlock`.
3. Tách thanh âm lượng thành Music và SFX, đồng thời hỗ trợ mute toàn bộ.
4. Sau khi gameplay ổn định mới thêm ambience phản ứng, phase music và ending stinger.

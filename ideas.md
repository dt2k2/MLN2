# Das Kapitalist — Design document

## Mục tiêu

Game đặt người chơi vào vai **Heinrich Müller**, chủ một xưởng dệt Đức từ Q1/1852 đến Q4/1857. Người chơi trải nghiệm hậu quả của quyết định trước, sau đó mới được giới thiệu tên và định nghĩa học thuật của hiện tượng.

Game không khẳng định mọi đường chơi tất yếu sụp đổ. Các ending khác nhau thể hiện rằng chủ thể có lựa chọn, trong khi cạnh tranh, quan hệ lao động, thị trường và tín dụng vẫn tạo ra áp lực cấu trúc.

## Vòng chơi

Mỗi quý, người chơi chọn tối đa ba trong sáu nhóm quyết định; mỗi nhóm chỉ dùng một lần:

1. Ngày lao động: tăng hoặc giảm 2 giờ.
2. Tiền lương: tăng hoặc giảm 10%.
3. Nhân sự: tuyển hoặc sa thải 8 người.
4. Máy móc: mua hoặc bán một máy.
5. Tích lũy: giữ lại 25%, 50%, 75% hoặc 100% lợi nhuận.
6. Tín dụng: vay $15.000, trả $5.000, $15.000 hoặc tất toán.

Lợi nhuận dương được chia thành phần tái đầu tư và tiêu dùng của chủ sở hữu. Lỗ được trừ toàn bộ khỏi tiền mặt. Đầu tư chủ động không được làm tiền âm; chi phí sản xuất và event vẫn có thể gây phá sản.

## Mô hình giá trị

- Tư bản bất biến: `c = khấu hao máy + nguyên liệu`.
- Tư bản khả biến: `v = quỹ tiền lương`.
- Giá trị mới chỉ do lao động sống tạo ra.
- Giá trị thặng dư: phần giá trị mới vượt giá trị sức lao động, cộng lợi thế siêu ngạch tạm thời khi thời gian lao động cá biệt thấp hơn mức xã hội.
- Tỷ suất giá trị thặng dư: `m′ = m / v`.
- Tỷ suất lợi nhuận lý thuyết: `p′ = m / (c + v)`.
- Tỷ suất lợi nhuận thực tế dùng lợi nhuận đã thực hiện sau chi phí và lãi.

Máy móc **không trực tiếp tạo giá trị mới**. Nó chuyển giá trị của mình vào sản phẩm qua khấu hao, tăng năng suất và có thể tạo lợi thế siêu ngạch cho một tư bản cá biệt trước khi kỹ thuật mới phổ biến.

## Thị trường

Ba đối thủ deterministic tạo mặt bằng ngành:

| Đối thủ | Tăng kỹ thuật | Đặc điểm                           |
| ------- | ------------: | ---------------------------------- |
| Bauer   |      0,5%/quý | Lao động thâm dụng                 |
| Schmidt |      1,5%/quý | Bám mức trung bình ngành           |
| Krupp   |      2,5%/quý | Công nghệ; bonus quy mô từ phase 3 |

Cầu hiệu dụng toàn ngành chịu tác động của chu kỳ, tiền lương, thất nghiệp xã hội và hiệu ứng event. Sa thải ở riêng xưởng Müller chỉ tác động vừa phải lên sức mua xã hội.

Khủng hoảng thừa chỉ được xác lập khi **tổng cung ngành vượt cầu hiệu dụng** đồng thời tồn kho của xưởng vượt 70% phần cầu của nó. Khủng hoảng được giải thích bằng quan hệ sản xuất–thực hiện, mất cân đối, tích lũy quá mức, giới hạn sức mua và tín dụng; không quy về một nguyên nhân duy nhất.

## Tín dụng

- Lãi chuẩn 8%/năm, đơn giản hóa thành 2%/quý.
- Lãi là chi phí trong quý, không tự nhập vào nợ gốc.
- Trần nợ $90.000.
- Dashboard hiển thị tiền mặt, nợ gốc và lãi quý tới.
- Khủng hoảng tín dụng 1857 chỉ xuất hiện khi có nợ.
- Tái cơ cấu cộng $2.000 nợ phạt và nhân đôi lãi trong đúng hai quý.

## Event

Xác suất event cơ bản là 45% mỗi quý, tối đa một event. Event có phase, prerequisite, once/cooldown và lựa chọn có điều kiện.

| Phase | Event                                                                                               |
| ----- | --------------------------------------------------------------------------------------------------- |
| 1     | Vải kém chất lượng; Thỉnh nguyện tiền lương; Đơn hàng quân đội                                      |
| 2     | Máy may hơi nước; Báo chí điều tra; Khủng hoảng bông; Công đoàn thành lập                           |
| 3     | Đình công toàn xưởng; Luật Xưởng máy; Krupp phát động chiến tranh giá                               |
| 4     | Khủng hoảng tín dụng 1857; Krupp đề nghị sáp nhập; Hoảng loạn sản xuất thừa; Bạo loạn khu công nhân |

Hiệu ứng nhiều quý dùng `TimedEffect`. Đình công làm giảm sản lượng tương lai, không xóa tồn kho. Luật Xưởng máy tạo trần giờ làm bền vững.

## Narrative

- Chapter intro ở lượt 1, 7, 13 và 19.
- Story beat có điều kiện cho cạnh tranh Bauer, `m′ > 100%`, Krupp vượt kỹ thuật, đội quân dự bị, tồn kho cao, `p′` giảm và hội nghị công nhân.
- Mỗi quý thêm một dòng **Neue Fabrik Gazette** vào log.
- Narrative dùng số liệu thật; không gán cho Heinrich hành động người chơi chưa chọn.
- Thứ tự presentation: Eureka → Achievement → Summary/Era Recap → Event → Story → Ending.

## 15 khái niệm

Hệ thống Codex gồm: hàng hóa; lao động xã hội cần thiết; tư bản bất biến; tư bản khả biến; giá trị thặng dư; thặng dư tuyệt đối; thặng dư tương đối; tỷ suất thặng dư; tích lũy tư bản; cấu tạo hữu cơ; đội quân công nghiệp dự bị; tỷ suất lợi nhuận; khủng hoảng thừa; mâu thuẫn cơ bản của CNTB; quy luật tỷ suất lợi nhuận có xu hướng giảm.

Khái niệm chỉ mở sau khi điều kiện gameplay xảy ra. Trang Hướng dẫn được phép tiết lộ đầy đủ.

## Cơ sở học thuật

- Karl Marx, _Tư bản_, Quyển I, Chương 1: hàng hóa và giá trị.
- Quyển I, Chương 9: tỷ suất giá trị thặng dư.
- Quyển I, Chương 12: giá trị thặng dư tương đối.
- Quyển III, Chương 3: quan hệ giữa tỷ suất giá trị thặng dư và tỷ suất lợi nhuận.

Xu hướng giảm của `p′` có các nhân tố chống lại; game không biến nó thành bộ đếm phá sản tất định.

# Hướng dẫn các khoảnh khắc Eureka

## Eureka là gì?

Trong game, **Eureka** là thời điểm người chơi đã gây ra hoặc chứng kiến một hiện tượng kinh tế, rồi game mới gọi tên khái niệm đứng sau hiện tượng đó.

Trình tự luôn là:

1. **Điều vừa xảy ra:** hành động của người chơi hoặc biến động của xưởng.
2. **Hậu quả quan sát được:** số liệu thật của ván chơi.
3. **Tên khái niệm:** thuật ngữ kinh tế chính trị Marxist.
4. **Giải thích và công thức:** giúp nối trải nghiệm với lý thuyết.

Ví dụ:

> Bạn kéo dài ngày lao động từ 10 lên 12 giờ, trong khi lương quý không đổi. Lượng lao động thặng dư tăng lên. Hiện tượng này được gọi là **giá trị thặng dư tuyệt đối**.

Các con số dưới đây chỉ là **ví dụ minh họa dễ tính**. Khi chơi, popup sử dụng chính số liệu của xưởng trong quý đó.

---

## 1. Hàng hóa

**Khi nào xuất hiện:** Xưởng hoàn tất lô sản phẩm đầu tiên để bán trên thị trường.

**Ví dụ:** Xưởng sản xuất 700 cuộn vải. Chúng không được làm ra để Heinrich trực tiếp sử dụng mà để bán, vì vậy chúng trở thành hàng hóa.

**Ý nghĩa:** Hàng hóa là sản phẩm lao động được tạo ra để trao đổi. Nó vừa có **giá trị sử dụng** vì đáp ứng một nhu cầu, vừa mang **giá trị** được biểu hiện trong trao đổi.

**Điều cần nhớ:** Không phải mọi vật phẩm đều là hàng hóa. Một sản phẩm tự làm chỉ để tự dùng không đi vào quan hệ trao đổi như hàng hóa.

---

## 2. Tư bản khả biến (`v`)

**Khi nào xuất hiện:** Xưởng trả kỳ lương đầu tiên cho công nhân.

**Ví dụ:** 32 công nhân nhận `$242` mỗi quý:

```text
v = 32 × $242 = $7.744
```

**Ý nghĩa:** Nhà tư bản không mua bản thân người công nhân mà mua **sức lao động** của họ trong một thời gian nhất định. Phần tư bản ứng ra cho sức lao động được gọi là tư bản khả biến vì lao động sống có thể tạo ra lượng giá trị mới lớn hơn chính `v`.

**Điều cần nhớ:** `v` là quỹ lương ứng trước trong mô hình, không phải toàn bộ giá trị do công nhân tạo ra.

---

## 3. Giá trị thặng dư (`m`)

**Khi nào xuất hiện:** Trong quý đầu tiên, lao động sống tạo ra giá trị mới lớn hơn quỹ lương.

**Ví dụ:**

```text
Giá trị mới = $13.105
v            =  $7.744
m            =  $5.361

m = giá trị mới − v
```

**Ý nghĩa:** Công nhân đã tái tạo giá trị sức lao động của mình và tiếp tục tạo thêm giá trị. Phần vượt quá `v` bị chủ sở hữu chiếm hữu là giá trị thặng dư.

**Điều cần nhớ:** `m` **không đồng nhất với lợi nhuận kế toán**. Lợi nhuận còn phụ thuộc hàng có bán được không, giá thị trường, tồn kho cũ, nguyên liệu, khấu hao và lãi vay.

---

## 4. Lao động xã hội cần thiết

**Khi nào xuất hiện:** Từ quý 2, thời gian xưởng cần để sản xuất một đơn vị cao hơn mức trung bình xã hội.

**Ví dụ:**

```text
Thời gian cá biệt của xưởng: 5,2 giờ/đơn vị
Thời gian xã hội cần thiết:  4,0 giờ/đơn vị
```

Xưởng tốn thêm 1,2 giờ nhưng thị trường không tự động công nhận toàn bộ phần lao động kém hiệu quả đó.

**Ý nghĩa:** Giá trị hàng hóa không do thời gian cá biệt của một xưởng tùy ý quyết định, mà chịu sự quy định của điều kiện sản xuất bình thường trong xã hội.

**Điều cần nhớ:** Làm lâu hơn không có nghĩa hàng hóa tự nhiên có giá trị cao hơn nếu nguyên nhân chỉ là năng suất thấp.

---

## 5. Tư bản bất biến (`c`)

**Khi nào xuất hiện:** Xưởng đưa thêm máy móc vào sản xuất, dù máy được mua bằng quyết định hay nhận từ một sự kiện.

**Ví dụ:** Heinrich mua một máy giá `$18.000`. Máy không tạo ra giá trị mới; mỗi quý, một phần giá trị của máy được chuyển vào sản phẩm thông qua khấu hao.

```text
c chuyển dịch = chi phí nguyên liệu + khấu hao máy
```

**Ý nghĩa:** Tư liệu sản xuất bảo tồn và chuyển giá trị đã có của chúng vào hàng hóa. Chúng không tạo ra phần giá trị mới như lao động sống.

**Điều cần nhớ:** **Giá trị máy đang ứng trước** và **phần giá trị máy chuyển dịch trong một quý** là hai đại lượng khác nhau.

---

## 6. Giá trị thặng dư tuyệt đối

**Khi nào xuất hiện:** Người chơi hoặc sự kiện kéo dài ngày lao động trong khi lương quý chưa tăng tương ứng.

**Ví dụ:**

```text
Trước: 10 giờ/ngày
Sau:   12 giờ/ngày
v:     không đổi trong quý
```

Hai giờ bổ sung kéo dài phần lao động vượt quá thời gian cần để tái tạo `v`, nhờ đó `m` có thể tăng.

**Ý nghĩa:** Giá trị thặng dư tuyệt đối được tạo ra bằng cách kéo dài ngày lao động hoặc tăng lượng lao động sống huy động, trong khi thời gian lao động cần thiết chưa giảm.

**Đánh đổi trong game:** Sản lượng và `m` có thể tăng, nhưng sức khỏe giảm và bất ổn tăng.

---

## 7. Giá trị thặng dư tương đối

**Khi nào xuất hiện:** Máy mới làm năng suất tăng, ngày lao động không dài hơn và thời gian cá biệt của xưởng thấp hơn thời gian xã hội.

**Ví dụ:**

```text
Trước khi mua máy: 0,18 đơn vị/giờ
Sau khi mua máy:   0,24 đơn vị/giờ
Thời gian cá biệt: 3,6 giờ/đơn vị
Thời gian xã hội:  4,0 giờ/đơn vị
```

**Ý nghĩa:** Xưởng đi trước kỹ thuật có thể sản xuất dưới mức thời gian xã hội và tạm thời thu **lợi nhuận siêu ngạch**. Khi cải tiến được phổ biến và làm rẻ tư liệu sinh hoạt của công nhân, thời gian lao động cần thiết có thể giảm; đó là nền tảng của giá trị thặng dư tương đối.

**Điều cần nhớ:** Một chiếc máy riêng lẻ không trực tiếp “đẻ ra” giá trị mới. Nó làm tăng năng suất và thay đổi điều kiện phân chia ngày lao động.

---

## 8. Tỷ suất giá trị thặng dư (`m′`)

**Khi nào xuất hiện:** `m′` vượt 100%.

**Ví dụ:**

```text
m  = $9.000
v  = $7.500
m′ = m / v × 100% = 120%
```

**Ý nghĩa:** Cứ `$1` tư bản khả biến tương ứng với `$1,20` giá trị thặng dư. Chỉ số này biểu hiện tỷ lệ giữa lao động thặng dư và lao động cần thiết trong mô hình.

**Điều cần nhớ:** `m′ = 120%` không có nghĩa lợi nhuận bằng 120% tổng vốn, vì máy móc, nguyên liệu và các khoản ứng trước khác chưa nằm trong mẫu số này.

---

## 9. Tích lũy tư bản

**Khi nào xuất hiện:** Lợi nhuận giữ lại đã thực sự tài trợ đáng kể cho máy móc hoặc sức lao động bổ sung.

**Ví dụ:**

```text
Quỹ tích lũy:       $12.000
Giá máy mới:        $18.000
Quỹ tài trợ máy:    $12.000, tức 66,7%
```

**Ý nghĩa:** Một phần kết quả do lao động tạo ra không được tiêu dùng cá nhân mà quay lại sản xuất dưới hình thái tư bản phụ thêm.

**Điều cần nhớ:** Chỉ chọn “giữ lại 75%” chưa đủ để mở khái niệm. Tiền đang nằm trong quỹ mới là **tích lũy dưới hình thái tiền tệ**; nó trở thành tư bản sản xuất phụ thêm khi được dùng để mở rộng sản xuất.

---

## 10. Cấu tạo hữu cơ của tư bản (`c/v`)

**Khi nào xuất hiện:** Sau cơ giới hóa, tư bản bất biến ứng trước tăng nhanh hơn tư bản khả biến và `c/v` vượt ngưỡng của game.

**Ví dụ:**

```text
c ứng trước = $90.000
v           =  $8.000
c/v         = 11,25
```

**Ý nghĩa:** Chỉ số phản ánh sự thay đổi cấu tạo kỹ thuật của sản xuất dưới hình thái giá trị: ngày càng nhiều máy móc và nguyên liệu được vận hành bởi một lượng tư bản khả biến tương đối nhỏ hơn.

**Điều cần nhớ:** `c/v` cao không tự động đồng nghĩa xưởng đang có lãi cao.

---

## 11. Đội quân công nghiệp dự bị

**Khi nào xuất hiện:** Hơn 20% lực lượng lao động đầu quý bị đẩy khỏi xưởng trong một biến động.

**Ví dụ:** Xưởng bắt đầu quý với 32 công nhân và sa thải 8 người:

```text
Tỷ lệ sa thải = 8 / 32 × 100% = 25%
```

**Ý nghĩa:** Những người thất nghiệp vẫn thuộc lực lượng lao động xã hội có thể được tư bản huy động trở lại. Sự tồn tại của họ đồng thời tạo áp lực lên tiền lương và người đang có việc.

**Điều cần nhớ:** Đây không đơn thuần là một con số “nhân viên chưa dùng”; nó biểu hiện quan hệ giữa tích lũy, cơ giới hóa và lao động dư thừa tương đối.

---

## 12. Tỷ suất lợi nhuận (`p′`)

**Khi nào xuất hiện:** Từ lượt 12, tỷ suất lợi nhuận lý thuyết của quý giảm so với quý trước.

**Ví dụ:**

```text
m                    = $8.000
Tổng tư bản ứng trước = $80.000
p′                   = 10%
```

```text
p′ = m / tổng tư bản ứng trước × 100%
```

**Ý nghĩa:** Nhà tư bản nhìn giá trị thặng dư trong quan hệ với toàn bộ tư bản ứng trước, khiến nguồn gốc của nó từ lao động sống bị che khuất.

**Điều cần nhớ:** Game còn hiển thị **tỷ suất lợi nhuận thực tế**, dùng lợi nhuận kế toán thay cho `m`. Hai chỉ số trả lời hai câu hỏi khác nhau.

---

## 13. Khủng hoảng thừa

**Khi nào xuất hiện:** Tổng cung ngành vượt cầu hiệu dụng, đồng thời tồn kho của xưởng vượt 70% phần cầu dành cho xưởng.

**Ví dụ:**

```text
Tổng cung ngành:          5.000 đơn vị
Cầu hiệu dụng ngành:      4.200 đơn vị
Tồn kho / cầu của xưởng:  85%
```

**Ý nghĩa:** Hàng hóa không “thừa” so với mọi nhu cầu của con người; chúng thừa so với nhu cầu có **khả năng thanh toán** trong quan hệ thị trường hiện tại. Giá trị đã sản xuất gặp khó khăn khi thực hiện thành tiền.

**Điều cần nhớ:** Khủng hoảng trong game không chỉ do lương thấp. Nó còn liên quan cạnh tranh, mở rộng sản xuất, mất cân đối cung–cầu và tín dụng.

---

## 14. Mâu thuẫn cơ bản của chủ nghĩa tư bản

**Khi nào xuất hiện:** Từ giai đoạn sau của ván chơi, sản xuất đã mang tính tập thể và xã hội, có `m`, nhưng quyền quyết định phân phối kết quả vẫn thuộc chủ sở hữu tư nhân.

**Ví dụ:** 32 công nhân cùng vận hành một hệ thống máy móc và tạo ra `$9.000` giá trị thặng dư. Heinrich quyết định phần nào được giữ lại để mở rộng xưởng và phần nào được rút cho tiêu dùng cá nhân.

**Ý nghĩa:** Sản xuất ngày càng phụ thuộc vào hợp tác xã hội, trong khi tư liệu sản xuất và kết quả vẫn chịu sự chiếm hữu tư nhân tư bản chủ nghĩa.

**Điều cần nhớ:** Đây là một quan hệ cấu trúc, không chỉ là đánh giá đạo đức rằng một cá nhân “tốt” hay “xấu”.

---

## 15. Quy luật tỷ suất lợi nhuận có xu hướng giảm

**Khi nào xuất hiện:** Game ghi nhận bốn quý tạo thành ba lần `p′` giảm liên tiếp, đồng thời `c/v` tăng và mức cơ giới hóa không lùi lại.

**Ví dụ:**

```text
Q1: 12,0%
Q2: 10,8%
Q3:  9,9%
Q4:  9,1%
```

Trong cùng thời gian, máy móc và tư bản bất biến tăng nhanh hơn tư bản khả biến.

**Ý nghĩa:** Vì chỉ lao động sống tạo ra giá trị mới, việc `c` tăng tương đối so với `v` có thể tạo sức ép làm `p′` giảm, ngay cả khi tổng `m` vẫn tăng.

**Điều cần nhớ:** Đây là một **xu hướng**, không phải đường giảm tự động và vĩnh viễn. Tăng mức độ khai thác lao động, giảm giá tư liệu sản xuất, mở rộng thị trường và nhiều nhân tố khác có thể chống lại hoặc làm gián đoạn xu hướng.

---

## Bốn cặp chỉ số rất dễ nhầm

| Chỉ số | Câu hỏi mà nó trả lời |
|---|---|
| `Giá trị mới` | Lao động sống được xã hội thừa nhận đã tạo ra bao nhiêu giá trị trong quý? |
| `m` | Phần giá trị mới vượt quá `v` là bao nhiêu? |
| `Lợi nhuận kế toán` | Sau bán hàng, giá vốn, khấu hao, lãi vay và thanh lý máy, xưởng lãi hay lỗ bao nhiêu? |
| `Dòng tiền hoạt động` | Hoạt động quý này thực sự làm tiền mặt tăng hay giảm bao nhiêu trước phần chủ sở hữu rút ra? |

| Tỷ suất | Công thức và ý nghĩa |
|---|---|
| `m′ = m/v` | Mức giá trị thặng dư so với tư bản khả biến. |
| `p′ = m/(c+v)` | Giá trị thặng dư so với toàn bộ tư bản ứng trước. |
| `p′ thực tế` | Lợi nhuận kế toán so với toàn bộ tư bản ứng trước. |
| `c/v` | Quan hệ giữa tư bản bất biến và tư bản khả biến. |

## Cách đọc một popup trong lúc chơi

Khi Eureka xuất hiện, hãy tự hỏi ba câu:

1. **Điều gì vừa thay đổi?** Một quyết định của mình hay một áp lực tự phát của thị trường?
2. **Con số nào chứng minh điều đó?** So sánh trước–sau hoặc tử số–mẫu số.
3. **Có đánh đổi gì?** Sản lượng, lợi nhuận, sức khỏe, bất ổn, nợ và tồn kho đã vận động cùng nhau như thế nào?

Mục tiêu không phải học thuộc 15 định nghĩa. Mục tiêu là nhận ra rằng các khái niệm liên kết thành một quá trình:

```text
Hàng hóa
→ ứng c và v
→ lao động sống tạo giá trị mới và m
→ cạnh tranh thúc đẩy tăng năng suất
→ m được giữ lại và tích lũy
→ c/v thay đổi, lao động bị hút vào hoặc đẩy ra
→ sản xuất mở rộng va chạm với khả năng thực hiện trên thị trường
→ mâu thuẫn và khủng hoảng bộc lộ
```


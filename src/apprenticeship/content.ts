import type { ApprenticeshipConceptId, RoundId } from "./types";

export interface RoundContent {
  id: RoundId;
  title: string;
  subtitle: string;
  brief: string[];
  interactHint: string[];
  concepts: {
    id: ApprenticeshipConceptId;
    title: string;
    explanation: string;
  }[];
  check: {
    question: string;
    options: string[];
    correctIndex: number;
    wrongExplanation: string;
  };
}

export const ROUNDS: Record<RoundId, RoundContent> = {
  1: {
    id: 1,
    title: "Từ tấm vải đến hàng hóa",
    subtitle: "Chặng 1 · Đưa hàng ra thị trường",
    brief: [
      "Xưởng của bạn vừa hoàn thành một tấm vải.",
      "Nó được làm ra để trao đổi, nhưng xưởng chỉ thu tiền khi tìm được người mua.",
    ],
    interactHint: ["Bấm “Đưa ra trao đổi” để đưa tấm vải sang thị trường."],
    concepts: [
      {
        id: "commodity",
        title: "Hàng hóa",
        explanation:
          "Tấm vải là hàng hóa vì vừa có công dụng cho người khác, vừa được làm ra để trao đổi. Khi có người mua, giá trị của nó được thực hiện, nghĩa là chuyển thành tiền cho xưởng.",
      },
    ],
    check: {
      question: "Điều gì biến một sản phẩm thành hàng hóa?",
      options: [
        "Nó được sản xuất bằng máy móc hiện đại.",
        "Nó vừa có ích cho người khác, vừa được làm ra để trao đổi.",
        "Nó có nhãn mác đẹp.",
      ],
      correctIndex: 1,
      wrongExplanation:
        "Máy móc hay nhãn mác không đủ. Hàng hóa cần cả giá trị sử dụng cho người khác và mục đích trao đổi.",
    },
  },
  2: {
    id: 2,
    title: "Giá trị đi qua xưởng",
    subtitle: "Chặng 2 · Giá trị cũ và giá trị mới",
    brief: [
      "Một tấm vải nhận giá trị cũ từ nguyên liệu và máy móc, đồng thời nhận giá trị mới từ lao động đang diễn ra.",
      "Tiền lương là khoản ứng trước để mua sức lao động. Nó sẽ được lao động sống tái tạo trong phần giá trị mới, nên không được cộng hai lần.",
    ],
    interactHint: [
      "Xác định vai trò của từng yếu tố: chuyển giá trị cũ, ứng mua sức lao động, hay tạo giá trị mới.",
      "Sau khi phân loại đúng, hãy theo dõi $60 giá trị mới được tách thành v và m như thế nào.",
    ],
    concepts: [
      {
        id: "constantCapital",
        title: "Tư bản bất biến (c)",
        explanation:
          "Nguyên liệu và phần hao mòn của máy chuyển giá trị đã có của chúng vào tấm vải. Marx gọi đây là tư bản bất biến vì lượng giá trị ấy chỉ được bảo toàn và chuyển sang sản phẩm, không tự tăng lên.",
      },
      {
        id: "variableCapital",
        title: "Tư bản khả biến (v)",
        explanation:
          "Tiền lương là phần tư bản ứng trước để mua sức lao động. Lao động của công nhân tạo ra giá trị mới: một phần bù lại khoản v đã ứng, phần còn lại có thể trở thành giá trị thặng dư.",
      },
      {
        id: "surplusValue",
        title: "Giá trị thặng dư (m)",
        explanation:
          "Lao động sống tạo $60 giá trị mới. Trong đó, $30 bù lại tiền lương đã ứng (v), còn $30 dôi ra là giá trị thặng dư (m). Máy và nguyên liệu không tạo ra phần dôi ra này.",
      },
    ],
    check: {
      question: "Vì sao tổng giá trị là $110, không phải $140?",
      options: [
        "$30 tiền lương đã được tái tạo bên trong $60 giá trị mới, nên không cộng thêm lần nữa.",
        "$30 tiền lương không có liên quan đến giá trị của sản phẩm.",
        "$30 giá trị thặng dư chỉ được tính sau khi hàng đã bán.",
      ],
      correctIndex: 0,
      wrongExplanation:
        "Giá trị hàng hóa = c $50 + giá trị mới $60 = $110. Bên trong $60 giá trị mới, $30 tái tạo v và $30 là m; cộng thêm v một lần nữa sẽ bị trùng.",
    },
  },
  3: {
    id: 3,
    title: "Kéo dài ngày lao động",
    subtitle: "Chặng 3 · Thêm hai giờ làm",
    brief: [
      "Ngày làm 8 giờ: 4 giờ tạo phần giá trị bù lại tiền lương, 4 giờ tạo phần dôi ra.",
      "Nếu bạn kéo dài ngày làm mà giữ nguyên lương, chuyện gì xảy ra?",
    ],
    interactHint: ["Kéo thanh từ 8 lên 10 giờ và quan sát hai phần của ngày lao động."],
    concepts: [
      {
        id: "absoluteSurplus",
        title: "Giá trị thặng dư tuyệt đối",
        explanation:
          "Kéo dài ngày lao động trong khi tiền lương không đổi làm số giờ lao động thặng dư tăng trực tiếp. Đây là cách tạo giá trị thặng dư tuyệt đối.",
      },
      {
        id: "surplusRate",
        title: "Tỷ suất giá trị thặng dư m′ = m / v",
        explanation:
          "m′ cho biết giá trị thặng dư lớn bao nhiêu so với tiền lương đã ứng. Khi m tăng còn v không đổi, m′ tăng; đổi lại, ngày làm dài hơn gây thêm áp lực lên sức khỏe công nhân.",
      },
    ],
    check: {
      question: "Kéo dài ngày làm từ 8 lên 10 giờ, giữ nguyên lương, làm gì với m′?",
      options: ["Giảm", "Không đổi", "Tăng"],
      correctIndex: 2,
      wrongExplanation: "v không đổi, m tăng → m′ = m/v tăng lên.",
    },
  },
  4: {
    id: 4,
    title: "Máy móc và chuẩn xã hội",
    subtitle: "Chặng 4 · Cùng giờ, nhiều hàng hơn",
    brief: [
      "Bạn mua máy mới. Vẫn 8 giờ lao động, nhưng sản lượng tăng từ 8 lên 12 đơn vị.",
      "Máy giúp làm mỗi đơn vị nhanh hơn; tổng giá trị mới do lao động sống tạo ra vẫn không đổi.",
    ],
    interactHint: [
      "Bấm “Áp dụng máy mới” để chạy so sánh trước/sau.",
      "Rồi bấm “Đối thủ cũng áp dụng máy” để xem chuẩn xã hội dịch chuyển.",
    ],
    concepts: [
      {
        id: "socialLaborTime",
        title: "Lao động xã hội cần thiết",
        explanation:
          "Đây là thời gian bình quân cần để làm ra một hàng hóa với kỹ thuật, tay nghề và cường độ lao động phổ biến trong xã hội. Khi máy mới được dùng rộng rãi, thời gian này giảm.",
      },
      {
        id: "relativeSurplus",
        title: "Giá trị thặng dư tương đối",
        explanation:
          "Xưởng đi trước có thể tạm thu lợi nhuận siêu ngạch. Khi cách sản xuất mới lan rộng và làm các hàng hóa thiết yếu của công nhân rẻ hơn, giá trị sức lao động giảm: thời gian tất yếu có thể từ 4 xuống 3,5 giờ, còn thời gian thặng dư tăng mà ngày làm không dài thêm.",
      },
    ],
    check: {
      question: "Máy mới giúp bạn sản xuất nhiều hơn. Tổng giá trị mới do lao động sống tạo ra:",
      options: ["Tăng cùng sản lượng", "Không đổi", "Giảm xuống"],
      correctIndex: 1,
      wrongExplanation:
        "Máy chuyển giá trị cũ nhiều hơn, nhưng chỉ lao động sống mới tạo giá trị mới — và số giờ lao động sống không đổi.",
    },
  },
  5: {
    id: 5,
    title: "Sản xuất chưa phải bán được",
    subtitle: "Chặng 5 · Hàng làm ra, tiền chưa về",
    brief: [
      "Cầu hiệu dụng dự kiến là 100 đơn vị: lượng hàng người mua vừa muốn vừa có khả năng thanh toán.",
      "Nhưng dự báo không phải bảo đảm. Cầu có thể giảm trước khi hàng được bán.",
    ],
    interactHint: ["Chọn một mức sản lượng và quan sát điều gì xảy ra khi cầu thay đổi."],
    concepts: [
      {
        id: "overproduction",
        title: "Khủng hoảng thừa",
        explanation:
          "Hàng hóa có thể dư thừa so với sức mua có khả năng thanh toán, dù nhu cầu xã hội vẫn còn. Quyết định cá biệt — sản xuất thận trọng hay mạnh tay — có thể giảm hoặc khuếch đại thiệt hại, nhưng không xóa được mâu thuẫn giữa xu hướng mở rộng sản xuất và giới hạn của khả năng thực hiện giá trị trên thị trường.",
      },
    ],
    check: {
      question: "Sản xuất 100 đơn vị, cầu thực tế chỉ 70. Vấn đề chính là:",
      options: [
        "Máy móc hỏng hóc",
        "Giá trị đã sản xuất chưa được thị trường thực hiện",
        "Công nhân lười biếng",
      ],
      correctIndex: 1,
      wrongExplanation:
        "Vấn đề nằm ở khâu thực hiện: một phần giá trị nằm trong hàng tồn kho và chưa chuyển thành tiền.",
    },
  },
  6: {
    id: 6,
    title: "Lợi nhuận quay lại xưởng",
    subtitle: "Chặng 6 · Lợi nhuận được dùng thế nào?",
    brief: [
      "Xưởng có $40 lợi nhuận. Chủ sở hữu sẽ rút để tiêu dùng hay giữ lại cho sản xuất?",
      "Máy mới giá $30, nên xưởng phải giữ lại ít nhất 75% lợi nhuận mới mua được.",
    ],
    interactHint: ["Chọn tỷ lệ giữ lại 25 / 50 / 75 / 100%.", "Bấm “Mua máy” khi quỹ đủ."],
    concepts: [
      {
        id: "capitalAccumulation",
        title: "Tích lũy tư bản",
        explanation:
          "Lợi nhuận giữ lại mới chỉ là tiền trong quỹ. Khi số tiền đó được ứng trở lại để mua thêm máy móc, nguyên liệu hoặc sức lao động, một phần giá trị thặng dư mới chuyển thành tư bản bổ sung.",
      },
    ],
    check: {
      question: "Khi nào phần lợi nhuận giữ lại thực sự trở thành tư bản phụ thêm?",
      options: [
        "Ngay khi bạn tính được lợi nhuận",
        "Khi bạn giữ tiền trong két",
        "Khi tiền giữ lại được ứng để mua thêm tư liệu sản xuất hoặc sức lao động",
      ],
      correctIndex: 2,
      wrongExplanation:
        "Lợi nhuận của chu chuyển trước phải được ứng trở lại để mua thêm tư liệu sản xuất hoặc sức lao động; lúc đó quy mô tư bản sản xuất mới thực sự mở rộng.",
    },
  },
};

export const ADVANCED_LOCKED_COUNT = 5;

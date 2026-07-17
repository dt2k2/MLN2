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
    subtitle: "Round 1 · Trao đổi",
    brief: [
      "Xưởng của bạn vừa hoàn thành một tấm vải.",
      "Tấm vải có ích, nhưng để có tiền, nó phải rời khỏi xưởng.",
    ],
    interactHint: ["Bấm “Đưa ra trao đổi” để đưa tấm vải sang thị trường."],
    concepts: [
      {
        id: "commodity",
        title: "Hàng hóa",
        explanation:
          "Tấm vải là hàng hóa vì vừa có công dụng cho người khác, vừa được sản xuất để trao đổi. Khi bán được, giá trị của nó mới được thực hiện thành tiền.",
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
    subtitle: "Round 2 · c, v, m",
    brief: [
      "Bốn dòng dưới đây giữ những vai trò khác nhau trong quá trình sản xuất.",
      "Hãy xác định giá trị cũ, vốn ứng cho sức lao động và nguồn tạo giá trị mới.",
    ],
    interactHint: [
      "Chọn một vai trò cho từng dòng giá trị.",
      "Lưu ý: tiền lương không tự tạo giá trị; lao động sống mới làm điều đó.",
    ],
    concepts: [
      {
        id: "constantCapital",
        title: "Tư bản bất biến (c)",
        explanation:
          "Nguyên liệu và hao mòn máy chỉ chuyển giá trị cũ vào sản phẩm — chúng không tự tạo giá trị mới.",
      },
      {
        id: "variableCapital",
        title: "Tư bản khả biến (v)",
        explanation:
          "Tiền lương là tư bản ứng ra để mua sức lao động. Trong sản xuất, lao động sống tạo ra một lượng giá trị mới đủ tái tạo v và còn có thể vượt quá v.",
      },
      {
        id: "surplusValue",
        title: "Giá trị thặng dư (m)",
        explanation:
          "Lao động sống tạo $60 giá trị mới: $30 tái tạo v và $30 còn lại là m. Máy và nguyên liệu chỉ chuyển giá trị đã có vào sản phẩm.",
      },
    ],
    check: {
      question: "Cái gì thực sự tạo ra $60 giá trị mới trong tấm vải?",
      options: ["Máy dệt", "Nguyên liệu bông", "Lao động sống của công nhân"],
      correctIndex: 2,
      wrongExplanation:
        "Máy và nguyên liệu chỉ chuyển giá trị cũ. Giá trị mới chỉ có thể đến từ lao động sống.",
    },
  },
  3: {
    id: 3,
    title: "Kéo dài ngày lao động",
    subtitle: "Round 3 · Thặng dư tuyệt đối",
    brief: [
      "Ngày làm 8 giờ: 4 giờ tái tạo giá trị sức lao động, 4 giờ tạo thặng dư.",
      "Nếu bạn kéo dài ngày làm mà giữ nguyên lương, chuyện gì xảy ra?",
    ],
    interactHint: ["Kéo thanh giờ từ 8 lên 10 để xem timeline thay đổi."],
    concepts: [
      {
        id: "absoluteSurplus",
        title: "Thặng dư tuyệt đối",
        explanation:
          "Tăng thặng dư bằng cách kéo dài ngày lao động mà không đổi lương. Phần thặng dư nở ra trực tiếp.",
      },
      {
        id: "surplusRate",
        title: "Tỷ suất thặng dư m′ = m / v",
        explanation:
          "Đo tỷ lệ giữa phần giá trị thặng dư và tư bản khả biến. Khi m tăng mà v không đổi, m′ tăng — đồng thời áp lực lên sức khỏe công nhân cũng lớn hơn.",
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
    subtitle: "Round 4 · Thặng dư tương đối",
    brief: [
      "Bạn mua máy mới. Cùng 8 giờ lao động sống, sản lượng nhảy từ 8 lên 12 đơn vị.",
      "Nhưng giá trị mới do lao động sống tạo ra thì… vẫn thế.",
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
          "Đây là thời gian cần để làm ra một hàng hóa trong điều kiện sản xuất bình thường của xã hội, với kỹ năng và cường độ lao động phổ biến. Khi cải tiến lan rộng, mức này giảm.",
      },
      {
        id: "relativeSurplus",
        title: "Thặng dư tương đối",
        explanation:
          "Xưởng đi trước tạm hưởng lợi nhuận siêu ngạch. Khi năng suất mới phổ biến và làm rẻ các tư liệu sinh hoạt như vải, thời gian tất yếu có thể giảm từ 4 xuống 3,5 giờ; phần thặng dư tăng mà ngày làm không dài thêm.",
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
    subtitle: "Round 5 · Khủng hoảng thừa",
    brief: [
      "Cầu hiệu dụng dự kiến 100 đơn vị. Bạn chọn sản xuất bao nhiêu?",
      "Thị trường không nợ ai lời hứa nào.",
    ],
    interactHint: ["Chọn một trong ba mức sản lượng: 80, 100, 140."],
    concepts: [
      {
        id: "overproduction",
        title: "Khủng hoảng thừa",
        explanation:
          "Không phải vì thiếu hàng mà vì hàng không bán được ở giá bù đắp chi phí. Sản xuất và thực hiện giá trị là hai chuyện khác nhau.",
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
        "Vấn đề nằm ở khâu thực hiện: giá trị được tạo ra nhưng không quy đổi thành tiền được.",
    },
  },
  6: {
    id: 6,
    title: "Lợi nhuận quay lại xưởng",
    subtitle: "Round 6 · Tích lũy",
    brief: [
      "Bạn có $40 lợi nhuận. Tiêu thụ hay đầu tư?",
      "Máy mới giá $30 — chỉ đủ nếu bạn giữ lại đúng mức.",
    ],
    interactHint: ["Chọn tỷ lệ giữ lại 25 / 50 / 75 / 100%.", "Bấm “Mua máy” khi quỹ đủ."],
    concepts: [
      {
        id: "capitalAccumulation",
        title: "Tích lũy tư bản",
        explanation:
          "Lợi nhuận giữ lại mới chỉ là quỹ tiền. Khi phần đó được dùng mua thêm máy móc, nguyên liệu hoặc sức lao động, giá trị thặng dư mới chuyển thành tư bản bổ sung.",
      },
    ],
    check: {
      question: "Khi nào lợi nhuận trở thành tư bản tích lũy?",
      options: [
        "Ngay khi bạn tính được lợi nhuận",
        "Khi bạn giữ tiền trong két",
        "Khi tiền giữ lại được chuyển thành tư liệu sản xuất mới",
      ],
      correctIndex: 2,
      wrongExplanation:
        "Lợi nhuận của chu chuyển trước phải được ứng trở lại để mua thêm tư liệu sản xuất hoặc sức lao động; lúc đó quy mô tư bản sản xuất mới thực sự mở rộng.",
    },
  },
};

export const ADVANCED_LOCKED_COUNT = 5;

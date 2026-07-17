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
    interactHint: [
      "Kéo tấm vải sang thị trường, hoặc bấm “Đưa ra trao đổi”.",
    ],
    concepts: [
      {
        id: "commodity",
        title: "Hàng hóa",
        explanation:
          "Sản phẩm của lao động vừa có công dụng (giá trị sử dụng) vừa được làm ra để trao đổi (giá trị). Chỉ khi nó rời xưởng và được người khác chấp nhận, nó mới thực sự là hàng hóa.",
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
      "Mỗi tấm vải ra khỏi xưởng mang theo bốn khoản chi phí.",
      "Chúng không cùng bản chất — hãy phân loại chúng.",
    ],
    interactHint: [
      "Kéo hoặc bấm để đưa từng khoản vào đúng ô.",
      "Chuyển giá trị cũ — hoặc Tạo giá trị mới.",
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
        explanation: "Tiền lương ứng ra để mua sức lao động — phần này biến thành giá trị mới.",
      },
      {
        id: "livingLabor",
        title: "Lao động sống tạo giá trị mới",
        explanation:
          "Chỉ lao động sống mới tạo ra giá trị mới (v + m). Máy không tự sinh ra giá trị — nó chỉ truyền giá trị cũ.",
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
      "Ngày làm 8 giờ: 4 giờ trả lương, 4 giờ thặng dư.",
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
          "Đo mức bóc lột. Khi m tăng mà v không đổi, m′ leo dốc — sức khỏe công nhân cũng vậy.",
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
      "Rồi bấm “Đối thủ áp dụng máy” để xem chuẩn xã hội dịch chuyển.",
    ],
    concepts: [
      {
        id: "socialLaborTime",
        title: "Lao động xã hội cần thiết",
        explanation:
          "Không phải thời gian bạn bỏ ra — mà là mức trung bình xã hội. Khi cả ngành áp máy, mức này giảm.",
      },
      {
        id: "relativeSurplus",
        title: "Thặng dư tương đối",
        explanation:
          "Khi lao động tất yếu rút ngắn (từ 4 xuống 3.5 giờ), phần thặng dư nở ra mà không cần kéo dài ngày làm.",
      },
      {
        id: "superProfit",
        title: "Lợi nhuận siêu ngạch",
        explanation:
          "Khoản chênh lệch tạm thời khi bạn năng suất hơn chuẩn xã hội. Nó biến mất khi đối thủ bắt kịp.",
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
    interactHint: [
      "Chọn tỷ lệ giữ lại 25 / 50 / 75 / 100%.",
      "Bấm “Mua máy” khi quỹ đủ.",
    ],
    concepts: [
      {
        id: "capitalAccumulation",
        title: "Tích lũy tư bản",
        explanation:
          "Chỉ khi lợi nhuận giữ lại thực sự biến thành tư liệu sản xuất mới, tư bản mới lớn lên. Giữ tiền trong két không phải tích lũy.",
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
        "Chỉ khi vòng M–C–M′ đóng lại — tiền biến thành máy/nguyên liệu — tư bản mới thực sự mở rộng.",
    },
  },
};

export const ADVANCED_LOCKED_COUNT = 5;

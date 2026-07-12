import type { GameState, StoryPresentation } from "./types";

const chapters: Record<number, Omit<StoryPresentation, "id">> = {
  1: {
    kind: "chapter",
    eyebrow: "Chương I · Q1/1852",
    title: "Sau những chiến lũy",
    body: "Bốn năm sau cách mạng 1848, Heinrich Müller tiếp quản xưởng dệt gia đình. Trật tự đã trở lại trên phố, nhưng cạnh tranh trong nhà máy chỉ mới bắt đầu.",
  },
  7: {
    kind: "chapter",
    eyebrow: "Chương II · 1853",
    title: "Nhịp máy mới",
    body: "Máy hơi nước lan qua vùng công nghiệp. Mỗi cải tiến hạ thời gian lao động cá biệt, đồng thời buộc những xưởng còn lại chạy nhanh hơn để tồn tại.",
  },
  13: {
    kind: "chapter",
    eyebrow: "Chương III · 1855",
    title: "Tập trung và cạnh tranh",
    body: "Những nhà sản xuất lớn bắt đầu định hình mặt bằng giá của toàn ngành. Heinrich không quyết định quy luật thị trường, nhưng mọi quyết định của ông đều diễn ra bên trong nó.",
  },
  19: {
    kind: "chapter",
    eyebrow: "Chương IV · 1856–1857",
    title: "Tín dụng trước cơn hoảng loạn",
    body: "Đơn hàng, tồn kho và hối phiếu cùng phình lên. Tín dụng kéo dài tích lũy, nhưng cũng nối số phận từng xưởng với khủng hoảng của cả thị trường.",
  },
};

function money(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function collectStories(state: GameState): StoryPresentation[] {
  const stories: StoryPresentation[] = [];
  const chapter = chapters[state.turn];
  if (chapter && !state.seenStoryIds[`chapter-${state.turn}`]) {
    stories.push({ id: `chapter-${state.turn}`, ...chapter });
  }

  const bauer = state.competitors.find((item) => item.id === "bauer");
  const krupp = state.competitors.find((item) => item.id === "krupp");
  const candidates: Array<StoryPresentation & { condition: boolean }> = [
    {
      id: "beat-bauer-pressure",
      kind: "beat",
      eyebrow: "Thư từ thương hội",
      title: "Bauer giữ người, giữ giá",
      body: `Bauer vẫn dựa vào lao động thâm dụng và đang nắm ${Math.round((bauer?.marketShare ?? 0) * 100)}% thị trường. Một đối thủ chậm đổi mới chưa chắc đã biến mất ngay.`,
      condition: state.turn >= 4 && (bauer?.marketShare ?? 0) > state.marketShare,
    },
    {
      id: "beat-surplus-rate",
      kind: "beat",
      eyebrow: "Nhật ký của Heinrich",
      title: "Một tỷ lệ vượt quá một trăm",
      body: `Quỹ lương quý vừa rồi là ${money(state.last.v)}, trong khi giá trị thặng dư đạt ${money(state.last.m)}. Con số ấy không nói máy móc tạo ra giá trị; nó đo quan hệ giữa lao động thặng dư và lao động tất yếu.`,
      condition: state.last.exploitation > 1,
    },
    {
      id: "beat-krupp-leads",
      kind: "beat",
      eyebrow: "Neue Fabrik Gazette",
      title: "Krupp vượt lên",
      body: `Chỉ số kỹ thuật của Krupp đã lên ${(krupp?.techLevel ?? 1).toFixed(2)}, cao hơn mức ${state.industryProductivity.toFixed(2)} của ngành. Giá trị xã hội đang dịch chuyển ngoài ý muốn của riêng Heinrich.`,
      condition: state.turn >= 8 && (krupp?.techLevel ?? 0) > state.industryProductivity * 1.04,
    },
    {
      id: "beat-reserve-army",
      kind: "beat",
      eyebrow: "Bên cổng xưởng",
      title: "Hàng người chờ việc",
      body: `${state.workersIdle} công nhân từng thuộc biên chế hiện không có ca làm. Đội quân dự bị gây sức ép lên tiền lương, nhưng cũng thu hẹp sức mua của thị trường.`,
      condition: state.workersIdle >= 16,
    },
    {
      id: "beat-overstock",
      kind: "beat",
      eyebrow: "Kho hàng",
      title: "Hàng hóa chưa thực hiện được giá trị",
      body: `Tồn kho đã lên ${Math.round(state.inventory)} đơn vị trong khi cầu quý mới là ${Math.round(state.demand)}. Sản xuất thừa ở đây là quan hệ giữa cung ngành, khả năng thực hiện và tín dụng, không chỉ là chuyện công nhân mua ít.`,
      condition: state.inventory > state.demand * 0.7,
    },
    {
      id: "beat-falling-profit",
      kind: "beat",
      eyebrow: "Sổ cái",
      title: "Tỷ suất lợi nhuận chịu sức ép",
      body: `Tỷ suất lợi nhuận lý thuyết giảm xuống ${(state.last.profitRate * 100).toFixed(1)}%. Năng suất, giá nguyên liệu, thị phần và tín dụng vẫn có thể chống lại hoặc làm nhanh thêm xu hướng này.`,
      condition:
        state.history.length >= 2 &&
        state.last.profitRate < state.history[state.history.length - 2].profitRate,
    },
    {
      id: "beat-workers-congress",
      kind: "beat",
      eyebrow: "Tin từ khu lao động",
      title: "Một hội nghị được triệu tập",
      body: `Chỉ số mâu thuẫn đã đạt ${Math.round(state.contradiction)}/100. Đại biểu công nhân bàn về giờ làm, tiền lương và quyền tổ chức; kết cục vẫn tùy thuộc những lựa chọn tiếp theo.`,
      condition: state.contradiction > 80,
    },
  ];

  for (const candidate of candidates) {
    if (!candidate.condition || state.seenStoryIds[candidate.id]) continue;
    const { condition: _condition, ...story } = candidate;
    stories.push(story);
  }
  return stories;
}

export function quarterNews(state: GameState): string {
  const record = state.last;
  if (record.profit < 0) {
    return `Neue Fabrik Gazette: Müller báo lỗ ${money(Math.abs(record.profit))}; tín dụng và tồn kho đang bị theo dõi.`;
  }
  if (record.industrySupply > record.effectiveDemand) {
    return `Neue Fabrik Gazette: cung toàn ngành vượt cầu hiệu dụng ${Math.round(record.industrySupply - record.effectiveDemand)} đơn vị.`;
  }
  return `Neue Fabrik Gazette: Müller giữ ${Math.round(state.marketShare * 100)}% thị phần, lợi nhuận thực hiện đạt ${money(record.profit)}.`;
}

import { defineTool } from "@lovable.dev/mcp-js";

const OVERVIEW = `# DAS KAPITALIST

Trò chơi mô phỏng nghiêm túc dạy Kinh tế Chính trị Marx-Lenin. Người chơi đóng vai một nhà tư bản thế kỷ 19 điều hành một nhà máy trong 24 quý (6 năm).

## Vòng chơi
Mỗi quý người chơi ra quyết định thuộc 6 nhóm:
- **WORKDAY** — kéo dài / rút ngắn ngày lao động (giá trị thặng dư tuyệt đối).
- **WAGES** — tăng / giảm tiền lương.
- **STAFFING** — thuê thêm / sa thải công nhân (đội quân dự bị).
- **MACHINERY** — mua / bán máy (thay đổi cấu tạo hữu cơ).
- **ACCUMULATION** — tỷ lệ tái đầu tư lợi nhuận giữ lại (25 / 50 / 75 / 100%).
- **CREDIT** — vay hoặc trả nợ.

Cuối quý, engine mô phỏng thị trường, cạnh tranh, năng suất, và các quy luật kinh tế xuất hiện dưới dạng chỉ số: m′, c/v, p′, mâu thuẫn, bất ổn xã hội, sức khỏe công nhân, thị phần.

## Kết cục có thể
revolution, bankruptcy, monopoly, merger, reform, timeout.

## Ba chỉ số cốt lõi hiển thị trên HUD
Sản lượng, giá bán, thị phần — và bên cạnh là cung, cầu, cầu hiệu dụng.
`;

export default defineTool({
  name: "get_game_overview",
  title: "Get game overview",
  description:
    "Return a Vietnamese overview of DAS KAPITALIST: the loop, decision groups, key metrics and possible endings.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: OVERVIEW }],
  }),
});

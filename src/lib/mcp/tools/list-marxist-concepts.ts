import { defineTool } from "@lovable.dev/mcp-js";
import { CONCEPT_INFO, CONCEPT_KEYS } from "@/game/concepts";

export default defineTool({
  name: "list_marxist_concepts",
  title: "List Marxist concepts",
  description:
    "List all Marxist political-economy concepts taught by the DAS KAPITALIST game, with their keys and short Vietnamese titles.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const items = CONCEPT_KEYS.map((key) => {
      const info = CONCEPT_INFO[key];
      return { key, title: info.title, short: info.short };
    });
    const text = items.map((c) => `- ${c.key} — ${c.title} (${c.short})`).join("\n");
    return {
      content: [{ type: "text", text }],
      structuredContent: { concepts: items },
    };
  },
});

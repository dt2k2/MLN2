import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CONCEPT_INFO, CONCEPT_KEYS } from "@/game/concepts";
import type { ConceptKey } from "@/game/types";

export default defineTool({
  name: "explain_marxist_concept",
  title: "Explain a Marxist concept",
  description:
    "Return the Vietnamese definition, symbol and (if available) formula for one Marxist concept covered by DAS KAPITALIST. Use `list_marxist_concepts` first to get valid keys.",
  inputSchema: {
    key: z
      .enum(CONCEPT_KEYS as [ConceptKey, ...ConceptKey[]])
      .describe("Concept key, e.g. 'surplusValue' or 'profitRate'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ key }) => {
    const info = CONCEPT_INFO[key];
    const lines = [
      `# ${info.title} (${info.short})`,
      "",
      info.definition,
    ];
    if (info.formula) lines.push("", `**Công thức:** ${info.formula}`);
    if (info.quote) lines.push("", `> ${info.quote.text} — ${info.quote.source}`);
    return {
      content: [{ type: "text", text: lines.join("\n") }],
      structuredContent: {
        key,
        title: info.title,
        short: info.short,
        definition: info.definition,
        formula: info.formula ?? null,
        quote: info.quote ?? null,
      },
    };
  },
});

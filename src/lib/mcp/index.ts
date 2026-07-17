import { defineMcp } from "@lovable.dev/mcp-js";
import listMarxistConcepts from "./tools/list-marxist-concepts";
import explainMarxistConcept from "./tools/explain-marxist-concept";
import getGameOverview from "./tools/get-game-overview";

export default defineMcp({
  name: "das-kapitalist-mcp",
  title: "DAS KAPITALIST MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools that describe the DAS KAPITALIST game (a Marxist political-economy simulation). Use `get_game_overview` for a high-level intro, `list_marxist_concepts` to enumerate the concepts covered, and `explain_marxist_concept` to look up the Vietnamese definition and formula of any single concept.",
  tools: [getGameOverview, listMarxistConcepts, explainMarxistConcept],
});

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MemoriesAiClient } from "../client.js";

export function registerSearchTools(server: McpServer, client: MemoriesAiClient): void {
  server.tool(
    "search_private",
    "Semantic search across your private video library. Find specific moments across all indexed videos using natural language " +
      "(e.g. 'videos where we talk about cystic acne', 'clips showing product application'). " +
      "Use BY_VIDEO for visual search, BY_AUDIO for audio/speech search, or BY_IMAGE for image search.",
    {
      search_param: z.string().describe("Natural language search query"),
      search_type: z.enum(["BY_VIDEO", "BY_AUDIO", "BY_IMAGE"]).describe("Search mode: BY_VIDEO (visual), BY_AUDIO (speech), BY_IMAGE (image)"),
      unique_id: z.string().optional().default("default").describe("Namespace to search in"),
      top_k: z.number().optional().describe("Maximum number of results to return"),
      filtering_level: z.enum(["low", "medium", "high"]).optional().describe("Result filtering strictness"),
      video_nos: z.array(z.string()).optional().describe("Limit search to these specific video IDs"),
      tag: z.string().optional().describe("Filter by tag"),
    },
    async (params) => {
      const result = await client.searchPrivate(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "search_public",
    "Search the public Memories.ai video library across TikTok, YouTube, and Instagram. " +
      "Useful for competitive research, finding trending content in specific niches, and discovering what's performing well on each platform.",
    {
      search_param: z.string().describe("Natural language search query"),
      search_type: z.enum(["BY_VIDEO", "BY_AUDIO"]).describe("Search mode: BY_VIDEO (visual) or BY_AUDIO (speech)"),
      type: z.enum(["TIKTOK", "YOUTUBE", "INSTAGRAM"]).optional().default("TIKTOK").describe("Platform to search"),
      top_k: z.number().optional().describe("Maximum number of results to return"),
      filtering_level: z.enum(["low", "medium", "high"]).optional().describe("Result filtering strictness"),
    },
    async (params) => {
      const result = await client.searchPublic(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "search_audio_transcripts",
    "Keyword search across audio transcripts in your private video library. " +
      "Find exact phrases or keywords mentioned across all your videos. Returns paginated results with snippets and timestamps.",
    {
      query: z.string().describe("Search string to find in audio transcripts"),
      unique_id: z.string().optional().describe("Namespace to search in"),
      page: z.number().optional().default(1).describe("Page number"),
      page_size: z.number().optional().default(50).describe("Results per page (max 100)"),
    },
    async (params) => {
      const result = await client.searchAudioTranscripts(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "search_public_audio_transcripts",
    "Keyword search across audio transcripts in the public video library. " +
      "Find exact phrases or keywords mentioned in publicly indexed videos.",
    {
      query: z.string().describe("Search string to find in audio transcripts"),
      page: z.number().optional().default(1).describe("Page number"),
      page_size: z.number().optional().default(50).describe("Results per page (max 100)"),
    },
    async (params) => {
      const result = await client.searchPublicAudioTranscripts(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}

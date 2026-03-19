import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MemoriesAiClient } from "../client.js";

export function registerChatTools(server: McpServer, client: MemoriesAiClient): void {
  server.tool(
    "video_chat",
    "Ask questions about one or more videos using AI. Supports deep analysis like 'What skincare claims are made in this video?', " +
      "'Compare the messaging across these competitor videos', 'Generate TikTok captions for this video'. " +
      "Use session_id to maintain multi-turn conversations. Videos must have reached PARSE status.",
    {
      video_nos: z.array(z.string()).describe("List of video IDs (video_no values) to analyze"),
      prompt: z.string().describe("Natural language question or instruction about the video(s)"),
      session_id: z.string().optional().describe("Session ID for multi-turn conversations. Omit for a new conversation."),
      unique_id: z.string().optional().default("default").describe("Namespace the videos belong to"),
    },
    async (params) => {
      const result = await client.videoChat(params);
      const parts: string[] = [];

      if (result.content) {
        parts.push(result.content);
      }

      if (result.references.length > 0) {
        parts.push("\n\n--- References ---\n" + JSON.stringify(result.references, null, 2));
      }

      return {
        content: [{ type: "text" as const, text: parts.join("") || "No response content received." }],
      };
    },
  );
}

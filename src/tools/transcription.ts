import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MemoriesAiClient } from "../client.js";

export function registerTranscriptionTools(server: McpServer, client: MemoriesAiClient): void {
  server.tool(
    "get_audio_transcription",
    "Get the spoken word transcription of a video — voiceovers, dialogue, spoken product descriptions, testimonials. " +
      "Returns timestamped segments. The video must have reached PARSE status first.",
    {
      video_no: z.string().describe("The video ID (video_no, NOT task_id). Get this from get_task_status or list_videos."),
      unique_id: z.string().optional().default("default").describe("Namespace the video belongs to"),
    },
    async (params) => {
      const result = await client.getAudioTranscription(params.video_no, params.unique_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_video_transcription",
    "Get visual content descriptions of a video — what's visually happening scene by scene (product shots, skin close-ups, " +
      "before/after reveals, text overlays, etc.). Returns timestamped segments. The video must have reached PARSE status first.",
    {
      video_no: z.string().describe("The video ID (video_no, NOT task_id). Get this from get_task_status or list_videos."),
      unique_id: z.string().optional().default("default").describe("Namespace the video belongs to"),
    },
    async (params) => {
      const result = await client.getVideoTranscription(params.video_no, params.unique_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "generate_summary",
    "Get a structured summary of a video. Choose CHAPTER for a scene-based chronological breakdown, " +
      "or TOPIC for semantic grouping by subject matter. Great for quick competitive analysis across many videos.",
    {
      video_no: z.string().describe("The video ID (video_no, NOT task_id)"),
      type: z.enum(["CHAPTER", "TOPIC"]).describe("Summary type: CHAPTER (scene-based) or TOPIC (semantic grouping)"),
      unique_id: z.string().optional().default("default").describe("Namespace the video belongs to"),
    },
    async (params) => {
      const result = await client.generateSummary(params.video_no, params.type, params.unique_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}

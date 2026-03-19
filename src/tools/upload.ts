import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MemoriesAiClient } from "../client.js";

export function registerUploadTools(server: McpServer, client: MemoriesAiClient): void {
  server.tool(
    "upload_video_from_url",
    "Upload videos from platform URLs (TikTok, YouTube, Instagram) to your private library for analysis. " +
      "You can also pass a creator profile URL (e.g. https://www.tiktok.com/@username) to bulk-ingest all their videos. " +
      "All URLs in a single request must be from the same platform. " +
      "Returns a taskId — use get_task_status to poll until videos reach PARSE status before using other tools.",
    {
      video_urls: z.array(z.string()).describe("Array of video or creator profile URLs. Must all be from the same platform."),
      unique_id: z.string().optional().default("default").describe("Namespace for organizing videos (e.g. 'my-brand', 'competitor-xyz')"),
      callback_url: z.string().optional().describe("Webhook URL for status notifications"),
      quality: z.number().optional().default(720).describe("Resolution cap: 1080, 720, 480, 260. Only effective for YouTube."),
    },
    async (params) => {
      const result = await client.uploadVideoFromUrl(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "upload_video_to_public",
    "Upload videos to the shared public Memories.ai library. WARNING: Public uploads are permanent, visible to all users, and cannot be deleted. " +
      "Use upload_video_from_url for private uploads instead unless you specifically want to contribute to the public library.",
    {
      video_urls: z.array(z.string()).describe("Array of video URLs. Must all be from the same platform."),
      callback_url: z.string().optional().describe("Webhook URL for status notifications"),
      quality: z.number().optional().default(720).describe("Resolution cap: 1080, 720, 480, 260. Only effective for YouTube."),
    },
    async (params) => {
      const result = await client.uploadVideoToPublic(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_task_status",
    "Check the status of a video upload/indexing task. Use this after uploading to get the video_no needed for all other tools. " +
      "Videos must reach PARSE status before transcription, summary, search, or chat will work. " +
      "IMPORTANT: video_no (from this tool) ≠ task_id (from upload). You need the video_no for everything else.",
    {
      task_id: z.string().describe("The taskId returned from an upload response"),
      unique_id: z.string().optional().default("default").describe("Namespace used during upload"),
    },
    async (params) => {
      const result = await client.getTaskStatus(params.task_id, params.unique_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "list_videos",
    "List uploaded videos in your private library with optional filters. Useful for browsing indexed content, finding video_no values, and checking processing status.",
    {
      page: z.number().optional().default(1).describe("Page number"),
      size: z.number().optional().default(20).describe("Results per page"),
      video_name: z.string().optional().describe("Filter by video name"),
      video_no: z.string().optional().describe("Filter by specific video ID"),
      unique_id: z.string().optional().default("default").describe("Namespace to list from"),
      status: z.string().optional().describe("Filter by status: PARSE, UNPARSE, or FAILED"),
    },
    async (params) => {
      const result = await client.listVideos(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "delete_videos",
    "Delete videos from your private library. Cannot delete videos from the public library. Maximum 100 video_no values per request.",
    {
      video_nos: z.array(z.string()).max(100).describe("Array of video_no values to delete (max 100)"),
      unique_id: z.string().optional().describe("Namespace the videos belong to"),
    },
    async (params) => {
      const result = await client.deleteVideos(params.video_nos, params.unique_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}

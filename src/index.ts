#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MemoriesAiClient } from "./client.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerTranscriptionTools } from "./tools/transcription.js";
import { registerSearchTools } from "./tools/search.js";
import { registerChatTools } from "./tools/chat.js";

const apiKey = process.env.MEMORIES_AI_API_KEY;
if (!apiKey) {
  console.error("Error: MEMORIES_AI_API_KEY environment variable is required");
  process.exit(1);
}

const server = new McpServer({
  name: "memories-ai",
  version: "1.0.0",
});

const client = new MemoriesAiClient(apiKey);

registerUploadTools(server, client);
registerTranscriptionTools(server, client);
registerSearchTools(server, client);
registerChatTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);

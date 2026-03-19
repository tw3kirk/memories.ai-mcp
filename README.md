# memories-ai-mcp

MCP (Model Context Protocol) server for the [Memories.ai](https://memories.ai) video analysis API. Enables Claude Desktop to upload, transcribe, search, summarize, and chat with video content from TikTok, YouTube, and Instagram.

## Features

- **Upload videos** from URLs or creator profiles (TikTok, YouTube, Instagram)
- **Transcribe** audio (spoken words) and video (visual scene descriptions)
- **Summarize** videos by chapter or topic
- **Semantic search** across private and public video libraries
- **Keyword search** across audio transcripts
- **Chat** with videos — ask questions, compare content, generate captions

## Getting an API Key

1. Sign up at [memories.ai](https://memories.ai)
2. Navigate to your account settings / API section
3. Generate an API key
4. See the [API docs](https://memories.ai/docs/API/) for details

## Setup

### Build

```bash
npm install
npm run build
```

### Environment Variable

Set your API key:

```bash
export MEMORIES_AI_API_KEY="your-api-key-here"
```

### Claude Desktop Configuration

Add this to your Claude Desktop config file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "memories-ai": {
      "command": "node",
      "args": ["/absolute/path/to/memories-ai-mcp/dist/index.js"],
      "env": {
        "MEMORIES_AI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `upload_video_from_url` | Upload videos from TikTok/YouTube/Instagram URLs or creator profiles |
| `upload_video_to_public` | Upload videos to the permanent public library |
| `get_task_status` | Check upload/indexing status and get `video_no` |
| `list_videos` | List uploaded videos with optional filters |
| `delete_videos` | Delete videos from your private library |
| `get_audio_transcription` | Get spoken word transcription with timestamps |
| `get_video_transcription` | Get visual content descriptions with timestamps |
| `generate_summary` | Get chapter-based or topic-based video summary |
| `search_private` | Semantic search across your private video library |
| `search_public` | Semantic search across TikTok/YouTube/Instagram public library |
| `search_audio_transcripts` | Keyword search across private audio transcripts |
| `search_public_audio_transcripts` | Keyword search across public audio transcripts |
| `video_chat` | Ask questions about videos using AI |

## Typical Workflow

1. **Upload** a video with `upload_video_from_url`
2. **Poll** with `get_task_status` until status is `PARSE`
3. **Analyze** using transcription, summary, search, or chat tools

## Important Notes

- **`video_no` ≠ `task_id`**: Upload returns a `task_id`. Use `get_task_status` to get the `video_no` needed by all other tools.
- **Async processing**: Videos must reach `PARSE` status before analysis tools work. Error code `0001` means still processing.
- **Platform batching**: Multiple URLs in one upload must all be from the same platform.
- **Public library is permanent**: Videos uploaded to the public library cannot be deleted.

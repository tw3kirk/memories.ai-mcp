import type {
  ApiResponse,
  UploadData,
  VideoInfo,
  TranscriptionData,
  SummaryData,
  SearchResult,
  AudioTranscriptResult,
  ChatResponse,
  ChatLine,
  ChatRefLine,
  ChatThinkingLine,
} from "./types.js";

const BASE_URL = "https://api.memories.ai";

export class MemoriesAiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private headers(contentType?: string): Record<string, string> {
    const h: Record<string, string> = {
      Authorization: this.apiKey,
    };
    if (contentType) h["Content-Type"] = contentType;
    return h;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.headers(options.body ? "application/json" : undefined),
        ...(options.headers as Record<string, string> | undefined),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as ApiResponse<T>;
  }

  private buildQuery(params: Record<string, string | number | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "";
    return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
  }

  // Upload video from URL
  async uploadVideoFromUrl(params: {
    video_urls: string[];
    unique_id?: string;
    callback_url?: string;
    quality?: number;
  }): Promise<ApiResponse<UploadData>> {
    return this.request<UploadData>("/serve/api/v1/scraper_url", {
      method: "POST",
      body: JSON.stringify({
        video_urls: params.video_urls,
        unique_id: params.unique_id ?? "default",
        ...(params.callback_url && { callback_url: params.callback_url }),
        ...(params.quality && { quality: params.quality }),
      }),
    });
  }

  // Upload video to public library
  async uploadVideoToPublic(params: {
    video_urls: string[];
    callback_url?: string;
    quality?: number;
  }): Promise<ApiResponse<UploadData>> {
    return this.request<UploadData>("/serve/api/v1/scraper_url_public", {
      method: "POST",
      body: JSON.stringify({
        video_urls: params.video_urls,
        ...(params.callback_url && { callback_url: params.callback_url }),
        ...(params.quality && { quality: params.quality }),
      }),
    });
  }

  // Get task status
  async getTaskStatus(taskId: string, uniqueId?: string): Promise<ApiResponse<VideoInfo[]>> {
    const query = this.buildQuery({ task_id: taskId, unique_id: uniqueId ?? "default" });
    return this.request<VideoInfo[]>(`/serve/api/v1/get_video_ids_by_task_id${query}`);
  }

  // List videos
  async listVideos(params: {
    page?: number;
    size?: number;
    video_name?: string;
    video_no?: string;
    unique_id?: string;
    status?: string;
  }): Promise<ApiResponse<{ records: VideoInfo[]; total: number }>> {
    return this.request<{ records: VideoInfo[]; total: number }>("/serve/api/v1/list_videos", {
      method: "POST",
      body: JSON.stringify({
        page: params.page ?? 1,
        size: params.size ?? 20,
        unique_id: params.unique_id ?? "default",
        ...(params.video_name && { video_name: params.video_name }),
        ...(params.video_no && { video_no: params.video_no }),
        ...(params.status && { status: params.status }),
      }),
    });
  }

  // Delete videos
  async deleteVideos(videoNos: string[], uniqueId?: string): Promise<ApiResponse<unknown>> {
    const query = this.buildQuery({ unique_id: uniqueId });
    return this.request<unknown>(`/serve/api/v1/delete_videos${query}`, {
      method: "POST",
      body: JSON.stringify(videoNos),
    });
  }

  // Get audio transcription
  async getAudioTranscription(videoNo: string, uniqueId?: string): Promise<ApiResponse<TranscriptionData>> {
    const query = this.buildQuery({ video_no: videoNo, unique_id: uniqueId ?? "default" });
    return this.request<TranscriptionData>(`/serve/api/v1/get_audio_transcription${query}`);
  }

  // Get video transcription
  async getVideoTranscription(videoNo: string, uniqueId?: string): Promise<ApiResponse<TranscriptionData>> {
    const query = this.buildQuery({ video_no: videoNo, unique_id: uniqueId ?? "default" });
    return this.request<TranscriptionData>(`/serve/api/v1/get_video_transcription${query}`);
  }

  // Generate summary
  async generateSummary(videoNo: string, type: string, uniqueId?: string): Promise<ApiResponse<SummaryData>> {
    const query = this.buildQuery({ video_no: videoNo, type, unique_id: uniqueId ?? "default" });
    return this.request<SummaryData>(`/serve/api/v1/generate_summary${query}`);
  }

  // Search private library
  async searchPrivate(params: {
    search_param: string;
    search_type: string;
    unique_id?: string;
    top_k?: number;
    filtering_level?: string;
    video_nos?: string[];
    tag?: string;
  }): Promise<ApiResponse<SearchResult[]>> {
    return this.request<SearchResult[]>("/serve/api/v1/search", {
      method: "POST",
      body: JSON.stringify({
        search_param: params.search_param,
        search_type: params.search_type,
        unique_id: params.unique_id ?? "default",
        ...(params.top_k && { top_k: params.top_k }),
        ...(params.filtering_level && { filtering_level: params.filtering_level }),
        ...(params.video_nos && { video_nos: params.video_nos }),
        ...(params.tag && { tag: params.tag }),
      }),
    });
  }

  // Search public library
  async searchPublic(params: {
    search_param: string;
    search_type: string;
    type?: string;
    top_k?: number;
    filtering_level?: string;
  }): Promise<ApiResponse<SearchResult[]>> {
    return this.request<SearchResult[]>("/serve/api/v1/search_public", {
      method: "POST",
      body: JSON.stringify({
        search_param: params.search_param,
        search_type: params.search_type,
        type: params.type ?? "TIKTOK",
        ...(params.top_k && { top_k: params.top_k }),
        ...(params.filtering_level && { filtering_level: params.filtering_level }),
      }),
    });
  }

  // Search audio transcripts (private)
  async searchAudioTranscripts(params: {
    query: string;
    unique_id?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<AudioTranscriptResult[]>> {
    const query = this.buildQuery({
      query: params.query,
      unique_id: params.unique_id,
      page: params.page ?? 1,
      page_size: params.page_size ?? 50,
    });
    return this.request<AudioTranscriptResult[]>(`/serve/api/v1/search_audio_transcripts${query}`);
  }

  // Search public audio transcripts
  async searchPublicAudioTranscripts(params: {
    query: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<AudioTranscriptResult[]>> {
    const query = this.buildQuery({
      query: params.query,
      page: params.page ?? 1,
      page_size: params.page_size ?? 50,
    });
    return this.request<AudioTranscriptResult[]>(`/serve/api/v1/search_public_audio_transcripts${query}`);
  }

  // Video chat (non-streaming, NDJSON response)
  async videoChat(params: {
    video_nos: string[];
    prompt: string;
    session_id?: string;
    unique_id?: string;
  }): Promise<ChatResponse> {
    const url = `${BASE_URL}/serve/api/v1/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers("application/json"),
      body: JSON.stringify({
        video_nos: params.video_nos,
        prompt: params.prompt,
        unique_id: params.unique_id ?? "default",
        ...(params.session_id && { session_id: params.session_id }),
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    const lines = text.split("\n").filter((l) => l.trim());

    const result: ChatResponse = { content: "", references: [], thinking: [] };

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line) as ChatLine;
        if ("type" in parsed) {
          if (parsed.type === "content") {
            result.content += parsed.content;
          } else if (parsed.type === "ref") {
            result.references.push(parsed as ChatRefLine);
          } else if (parsed.type === "thinking") {
            result.thinking.push(parsed as ChatThinkingLine);
          }
        }
      } catch {
        // Skip unparseable lines
      }
    }

    return result;
  }
}

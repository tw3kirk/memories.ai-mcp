// Memories.ai API response wrapper
export interface ApiResponse<T = unknown> {
  code: string;
  msg: string;
  data: T;
  success: boolean;
  failed: boolean;
}

// Upload response
export interface UploadData {
  taskId: string;
}

// Video object from task status / list
export interface VideoInfo {
  video_no: string;
  video_name: string;
  video_url?: string;
  status: "PARSE" | "UNPARSE" | "FAILED";
  duration?: number;
  size?: number;
  create_time?: string;
}

// Transcription segment
export interface TranscriptionSegment {
  index: number;
  content: string;
  startTime: string;
  endTime: string;
}

export interface TranscriptionData {
  videoNo: string;
  transcriptions: TranscriptionSegment[];
}

// Summary
export interface SummaryItem {
  title: string;
  description: string;
  start: string;
}

export interface SummaryData {
  summary: string;
  items: SummaryItem[];
}

// Search result
export interface SearchResult {
  videoNo: string;
  videoName: string;
  startTime: number;
  endTime: number;
  score: number;
}

// Audio transcript search result
export interface AudioTranscriptResult {
  snippet: string;
  timestamp: string;
  audio_id: string;
}

// Chat response line types
export interface ChatThinkingLine {
  type: "thinking";
  title: string;
  content: string;
}

export interface ChatRefLine {
  type: "ref";
  [key: string]: unknown;
}

export interface ChatContentLine {
  type: "content";
  role: string;
  content: string;
}

export interface ChatDoneLine {
  code: string;
  data: string;
}

export type ChatLine = ChatThinkingLine | ChatRefLine | ChatContentLine | ChatDoneLine;

// Parsed chat response
export interface ChatResponse {
  content: string;
  references: ChatRefLine[];
  thinking: ChatThinkingLine[];
}

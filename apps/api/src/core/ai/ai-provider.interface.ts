export interface AiRequest {
  prompt: string;
  model: string;
  apiKey?: string;
  baseUrl: string;
  timeoutMs: number;
}

export interface AiTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiResponse {
  provider: 'openai';
  model: string;
  content: string;
  requestId?: string;
  usage: AiTokenUsage;
}

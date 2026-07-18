export interface AiWritingUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiWritingProviderResponse {
  provider: string;
  model: string;
  content: string;
  usage: AiWritingUsage;
  requestId?: string;
}

export interface AiWritingProvider {
  readonly providerName: string;
  generate(prompt: string): Promise<AiWritingProviderResponse>;
}
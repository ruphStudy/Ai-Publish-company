export interface ChapterProviderResponse {
  provider: string;
  model: string;
  content: string;
  requestId?: string;
}

export interface AiChapterProvider {
  readonly providerName: string;
  generate(prompt: string): Promise<ChapterProviderResponse>;
}
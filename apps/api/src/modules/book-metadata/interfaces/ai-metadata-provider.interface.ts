export interface MetadataProviderResponse {
  provider: string;
  model: string;
  content: string;
  requestId?: string;
}

export interface AiMetadataProvider {
  readonly providerName: string;
  generate(prompt: string): Promise<MetadataProviderResponse>;
}
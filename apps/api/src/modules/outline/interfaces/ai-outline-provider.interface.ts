export interface OutlineProviderRequest {
  prompt: string;
}

export interface OutlineProviderResponse {
  provider: string;
  model: string;
  content: string;
  requestId?: string;
}

export interface AiOutlineProvider {
  readonly providerName: string;
  generate(request: OutlineProviderRequest): Promise<OutlineProviderResponse>;
}

export const AI_OUTLINE_PROVIDER = Symbol('AI_OUTLINE_PROVIDER');

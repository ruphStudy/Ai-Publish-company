import type { AiRequest, AiResponse } from '../ai-provider.interface';

export class MockAiProvider {
  constructor(private readonly content = '{"ok":true}') {}
  readonly requests: AiRequest[] = [];

  async generate(request: AiRequest): Promise<AiResponse> {
    this.requests.push(request);
    return {
      provider: 'openai', model: request.model, content: this.content,
      requestId: 'mock-request',
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    };
  }
}

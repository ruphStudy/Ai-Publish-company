import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { AiRequest, AiResponse } from './ai-provider.interface';
import { AiResponseParser } from './ai-response-parser';

@Injectable()
export class OpenAiClientService {
  constructor(private readonly parser: AiResponseParser) {}

  async generate(request: AiRequest): Promise<AiResponse> {
    if (!request.apiKey) throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

    try {
      const response = await fetch(`${request.baseUrl}/responses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${request.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: request.model, input: request.prompt }),
        signal: controller.signal,
      });
      const payload = await response.json() as Record<string, unknown>;
      if (!response.ok) throw new ServiceUnavailableException(
        this.parser.extractError(payload) ?? 'OpenAI request failed');
      const content = this.parser.extractContent(payload);
      if (!content) throw new ServiceUnavailableException('OpenAI returned an empty response');
      return {
        provider: 'openai', model: request.model, content,
        requestId: typeof payload._request_id === 'string' ? payload._request_id : undefined,
        usage: this.parser.extractUsage(payload),
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException(
        error instanceof Error ? `OpenAI request failed: ${error.message}` : 'OpenAI request failed');
    } finally {
      clearTimeout(timeout);
    }
  }
}

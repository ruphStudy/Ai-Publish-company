import { Injectable } from '@nestjs/common';
import { OpenAiClientService } from '../../../core/ai/openai-client.service';
import { aiWritingConfig } from '../config/ai-writing.config';
import { AiWritingProvider, AiWritingProviderResponse } from '../interfaces/ai-writing-provider.interface';

@Injectable()
export class OpenAIWritingProvider implements AiWritingProvider {
  readonly providerName = 'openai';
  constructor(private readonly client: OpenAiClientService) {}

  async generate(prompt: string): Promise<AiWritingProviderResponse> {
    const response = await this.client.generate({
      prompt,
      model: aiWritingConfig.openai.model,
      apiKey: aiWritingConfig.openai.apiKey,
      baseUrl: aiWritingConfig.openai.baseUrl,
      timeoutMs: aiWritingConfig.openai.timeoutMs,
    });
    return response;
  }
}

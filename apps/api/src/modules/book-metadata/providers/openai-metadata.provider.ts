import { Injectable } from '@nestjs/common';
import { OpenAiClientService } from '../../../core/ai/openai-client.service';
import { bookMetadataConfig } from '../config/book-metadata.config';
import { AiMetadataProvider, MetadataProviderResponse } from '../interfaces/ai-metadata-provider.interface';

@Injectable()
export class OpenAiMetadataProvider implements AiMetadataProvider {
  readonly providerName = 'openai';
  constructor(private readonly client: OpenAiClientService) {}

  async generate(prompt: string): Promise<MetadataProviderResponse> {
    return this.client.generate({
      prompt,
      model: bookMetadataConfig.openai.model,
      apiKey: bookMetadataConfig.openai.apiKey,
      baseUrl: bookMetadataConfig.openai.baseUrl,
      timeoutMs: bookMetadataConfig.openai.timeoutMs,
    });
  }
}

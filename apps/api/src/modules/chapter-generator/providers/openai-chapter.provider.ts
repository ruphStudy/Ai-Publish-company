import { Injectable } from '@nestjs/common';
import { OpenAiClientService } from '../../../core/ai/openai-client.service';
import { chapterGeneratorConfig } from '../config/chapter-generator.config';
import { AiChapterProvider, ChapterProviderResponse } from '../interfaces/ai-chapter-provider.interface';

@Injectable()
export class OpenAiChapterProvider implements AiChapterProvider {
  readonly providerName = 'openai';
  constructor(private readonly client: OpenAiClientService) {}

  async generate(prompt: string): Promise<ChapterProviderResponse> {
    return this.client.generate({
      prompt,
      model: chapterGeneratorConfig.openai.model,
      apiKey: chapterGeneratorConfig.openai.apiKey,
      baseUrl: chapterGeneratorConfig.openai.baseUrl,
      timeoutMs: chapterGeneratorConfig.openai.timeoutMs,
    });
  }
}

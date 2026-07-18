import { Injectable } from '@nestjs/common';
import { aiWritingConfig } from '../config/ai-writing.config';
import { AiWritingProvider } from '../interfaces/ai-writing-provider.interface';
import { OpenAIWritingProvider } from './openai-writing.provider';

@Injectable()
export class AIWritingProviderFactory {
  constructor(
    private readonly openAIWritingProvider: OpenAIWritingProvider,
  ) {}

  getProvider(): AiWritingProvider {
    switch (aiWritingConfig.provider.toLowerCase()) {
      case 'openai':
        return this.openAIWritingProvider;
      default:
        throw new Error(
          `Unsupported AI writing provider: ${aiWritingConfig.provider}`,
        );
    }
  }
}
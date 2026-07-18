import { Injectable } from '@nestjs/common';
import { AiWritingUsage } from './interfaces/ai-writing-provider.interface';

@Injectable()
export class TokenUsageTracker {
  create(usage: AiWritingUsage): Record<string, number> {
    return {
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
    };
  }
}
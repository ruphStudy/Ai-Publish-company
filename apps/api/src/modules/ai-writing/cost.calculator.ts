import { Injectable } from '@nestjs/common';
import { aiWritingConfig } from './config/ai-writing.config';
import { AiWritingUsage } from './interfaces/ai-writing-provider.interface';

@Injectable()
export class CostCalculator {
  calculate(usage: AiWritingUsage): number {
    const inputCost =
      (usage.promptTokens / 1_000_000) *
      aiWritingConfig.openai.inputCostPerMillionTokens;

    const outputCost =
      (usage.completionTokens / 1_000_000) *
      aiWritingConfig.openai.outputCostPerMillionTokens;

    return Number((inputCost + outputCost).toFixed(8));
  }
}
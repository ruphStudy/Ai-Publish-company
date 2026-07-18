import { Injectable } from '@nestjs/common';
import { aiInsightsDefaultPolicy } from './config/ai-insights.config';
import { AIProviderResolver } from './ai-provider.resolver';
import { AIResponseNormalizer } from './ai-response.normalizer';
import { InsightPromptBuilder } from './insight-prompt.builder';
import type { InsightGenerationContext } from './interfaces/ai-insights.interface';

@Injectable()
export class InsightGenerationEngine {
  constructor(private readonly providerResolver: AIProviderResolver, private readonly prompts: InsightPromptBuilder, private readonly normalizer: AIResponseNormalizer) {}
  async generate(context: InsightGenerationContext, providerKey?: string, model?: string) {
    const { prompt, promptVersion } = this.prompts.build(context); const provider = this.providerResolver.resolve(providerKey); const selectedModel = model ?? aiInsightsDefaultPolicy.defaultModel;
    if (!provider) return { insights: this.normalizer.normalize(''), provider: providerKey ?? aiInsightsDefaultPolicy.defaultProvider, model: selectedModel, promptVersion, usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
    const response = await provider.generate({ prompt, model: selectedModel, baseUrl: '', timeoutMs: 30_000 });
    return { insights: this.normalizer.normalize(response.content), provider: response.provider, model: response.model, promptVersion, usage: response.usage };
  }
}

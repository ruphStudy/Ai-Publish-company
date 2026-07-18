import { BadRequestException, Injectable } from '@nestjs/common';
import { AiProviderFactory } from '../../core/ai/ai-provider.factory';
import { aiInsightsDefaultPolicy } from './config/ai-insights.config';
import { AIProviderRegistry } from './ai-provider.registry';

@Injectable()
export class AIProviderResolver {
  constructor(private readonly registry: AIProviderRegistry, private readonly aiFactory: AiProviderFactory) {}
  resolve(providerKey?: string) { const selected = providerKey ?? aiInsightsDefaultPolicy.defaultProvider; if (!this.registry.has(selected)) throw new BadRequestException(`AI provider is not enabled: ${selected}`); return selected === 'openai' ? this.aiFactory.getOpenAi() : null; }
}

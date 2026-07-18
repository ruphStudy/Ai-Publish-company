import { Injectable } from '@nestjs/common';
import { aiInsightsDefaultPolicy } from './config/ai-insights.config';

@Injectable()
export class AIProviderRegistry {
  enabled() { return aiInsightsDefaultPolicy.enabledAIProviders; }
  has(providerKey: string) { return this.enabled().includes(providerKey); }
}

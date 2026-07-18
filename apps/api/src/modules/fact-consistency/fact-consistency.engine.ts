import { Injectable } from '@nestjs/common';
import { AiProviderFactory } from '../../core/ai/ai-provider.factory';
import { aiWritingConfig } from '../ai-writing/config/ai-writing.config';
import type { FactAnalysisResult, FactConsistencyInput } from './interfaces/fact-consistency.interface';
import { ClaimExtractionStrategy } from './strategies/claim-extraction.strategy';
import { DeterministicConsistencyStrategy } from './strategies/deterministic-consistency.strategy';
import { SupportConsistencyStrategy } from './strategies/support-consistency.strategy';

@Injectable()
export class FactConsistencyEngine {
  constructor(private readonly extraction: ClaimExtractionStrategy, private readonly deterministic: DeterministicConsistencyStrategy, private readonly support: SupportConsistencyStrategy, private readonly providers: AiProviderFactory) {}
  async analyze(input: FactConsistencyInput): Promise<FactAnalysisResult> {
    const startedAt = Date.now(); const claims = this.extraction.extract(input); const issues = [...this.deterministic.analyze(input, claims), ...this.support.analyze(input, claims)];
    let provider = 'internal'; let model = 'deterministic-v1'; let tokenUsage: Record<string, number> = {}; let estimatedCost = 0;
    if (process.env.FACT_CONSISTENCY_AI_ASSISTED === 'true') {
      const response = await this.providers.getOpenAi().generate({ prompt: `Identify possible semantic contradictions in the supplied content. Return JSON only. Do not claim external verification or real-world truth. Content:\n${input.content}`, model: aiWritingConfig.openai.model, apiKey: aiWritingConfig.openai.apiKey, baseUrl: aiWritingConfig.openai.baseUrl, timeoutMs: aiWritingConfig.openai.timeoutMs });
      provider = response.provider; model = response.model; tokenUsage = { ...response.usage }; estimatedCost = (response.usage.promptTokens * aiWritingConfig.openai.inputCostPerMillionTokens + response.usage.completionTokens * aiWritingConfig.openai.outputCostPerMillionTokens) / 1_000_000;
      try { JSON.parse(response.content) as unknown; } catch { /* Deterministic results remain authoritative when structured AI output is invalid. */ }
    }
    return { claims, issues, provider, model, tokenUsage, estimatedCost, processingTime: Date.now() - startedAt };
  }
}

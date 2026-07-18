import { Injectable } from '@nestjs/common';
import { AiProviderFactory } from '../../core/ai/ai-provider.factory';
import { aiWritingConfig } from '../ai-writing/config/ai-writing.config';
import { AiRepetitionStrategy } from './strategies/ai-repetition.strategy';
import { CopyrightRiskStrategy } from './strategies/copyright-risk.strategy';
import { DuplicateDetectionStrategy } from './strategies/duplicate-detection.strategy';
import { DetectionInput } from './interfaces/plagiarism-strategy.interface';

@Injectable()
export class PlagiarismDetectionEngine {
  constructor(private readonly duplicate: DuplicateDetectionStrategy, private readonly repetition: AiRepetitionStrategy, private readonly copyright: CopyrightRiskStrategy, private readonly providers: AiProviderFactory) {}
  async detect(input: DetectionInput) {
    const startedAt = Date.now(); const duplicate = this.duplicate.detect(input); const repetition = this.repetition.detect(input); const copyright = this.copyright.detect(input);
    let provider = 'internal'; let model = 'heuristic-v1'; let tokenUsage: Record<string, number> = {}; let estimatedCost = 0; let aiRecommendations: string[] = [];
    if (process.env.PLAGIARISM_AI_ASSISTED === 'true') { const response = await this.providers.getOpenAi().generate({ prompt: `Review only the supplied manuscript for structural similarity and originality risk. Do not claim internet-wide matching. Return JSON with recommendations string array. Manuscript:\n${input.content}`, model: aiWritingConfig.openai.model, apiKey: aiWritingConfig.openai.apiKey, baseUrl: aiWritingConfig.openai.baseUrl, timeoutMs: aiWritingConfig.openai.timeoutMs }); provider = response.provider; model = response.model; tokenUsage = { ...response.usage }; estimatedCost = (response.usage.promptTokens * aiWritingConfig.openai.inputCostPerMillionTokens + response.usage.completionTokens * aiWritingConfig.openai.outputCostPerMillionTokens) / 1_000_000; try { const parsed = JSON.parse(response.content) as { recommendations?: unknown }; if (Array.isArray(parsed.recommendations)) aiRecommendations = parsed.recommendations.filter((value): value is string => typeof value === 'string'); } catch { aiRecommendations = []; } }
    const similarityScore = duplicate.score; const duplicateScore = duplicate.score; const copyrightRiskScore = copyright.score; const aiRepetitionScore = repetition.score; const originalityScore = Math.max(0, Math.round(100 - similarityScore * 0.45 - duplicateScore * 0.25 - copyrightRiskScore * 0.2 - aiRepetitionScore * 0.1));
    return { originalityScore, similarityScore, duplicateScore, copyrightRiskScore, aiRepetitionScore, findings: [...duplicate.findings, ...repetition.findings, ...copyright.findings], matchedSections: duplicate.matches, duplicateLocations: [...new Set(duplicate.matches.flatMap((match) => [match.sourceLocation, match.matchedLocation]))], recommendations: [...new Set([...aiRecommendations, ...(duplicate.score ? ['Rewrite or consolidate internally duplicated passages.'] : []), ...(copyright.score ? ['Verify quotation attribution and permission requirements.'] : []), ...(repetition.score ? ['Vary formulaic phrasing and sentence construction.'] : [])])], provider, model, tokenUsage, estimatedCost, processingTime: Date.now() - startedAt };
  }
}

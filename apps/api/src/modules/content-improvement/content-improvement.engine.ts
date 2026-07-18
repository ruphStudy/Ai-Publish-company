import { BadRequestException, Injectable } from '@nestjs/common';
import { AiProviderFactory } from '../../core/ai/ai-provider.factory';
import { aiWritingConfig } from '../ai-writing/config/ai-writing.config';
import { ImprovementMetrics, ImprovementMode, ImprovementScope } from './entities/content-improvement.entity';

export interface StructuredImprovementResponse {
  improvedContent: string;
  summary: string;
  appliedIssueIds: string[];
  unresolvedIssueIds: string[];
  metrics: ImprovementMetrics;
}

export interface ImprovementExecutionResult extends StructuredImprovementResponse {
  provider: string;
  model: string;
  tokenUsage: Record<string, number>;
  estimatedCost: number;
  latencyMs: number;
  requestMetadata: Record<string, unknown>;
}

@Injectable()
export class ContentImprovementEngine {
  constructor(private readonly providers: AiProviderFactory) {}

  async improve(input: { content: string; scope: ImprovementScope; mode: ImprovementMode; issueIds: string[]; instruction?: string }): Promise<ImprovementExecutionResult> {
    const startedAt = Date.now();
    const response = await this.providers.getOpenAi().generate({
      prompt: this.prompt(input),
      model: aiWritingConfig.openai.model,
      apiKey: aiWritingConfig.openai.apiKey,
      baseUrl: aiWritingConfig.openai.baseUrl,
      timeoutMs: aiWritingConfig.openai.timeoutMs,
    });
    const parsed = this.parse(response.content);
    const estimatedCost = (response.usage.promptTokens * aiWritingConfig.openai.inputCostPerMillionTokens + response.usage.completionTokens * aiWritingConfig.openai.outputCostPerMillionTokens) / 1_000_000;
    return { ...parsed, provider: response.provider, model: response.model, tokenUsage: { ...response.usage }, estimatedCost, latencyMs: Date.now() - startedAt, requestMetadata: { requestId: response.requestId, promptVersion: aiWritingConfig.generation.promptVersion } };
  }

  parse(content: string): StructuredImprovementResponse {
    let value: unknown;
    try { value = JSON.parse(content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '')); } catch { throw new BadRequestException('Improvement provider returned invalid JSON'); }
    if (!value || typeof value !== 'object') throw new BadRequestException('Improvement provider returned invalid structured output');
    const data = value as Record<string, unknown>;
    if (typeof data.improvedContent !== 'string' || !data.improvedContent.trim() || typeof data.summary !== 'string' || !Array.isArray(data.appliedIssueIds) || !Array.isArray(data.unresolvedIssueIds) || !this.metrics(data.metrics)) throw new BadRequestException('Improvement provider returned incomplete structured output');
    return { improvedContent: data.improvedContent, summary: data.summary, appliedIssueIds: data.appliedIssueIds.filter((item): item is string => typeof item === 'string'), unresolvedIssueIds: data.unresolvedIssueIds.filter((item): item is string => typeof item === 'string'), metrics: data.metrics };
  }

  private metrics(value: unknown): value is ImprovementMetrics {
    if (!value || typeof value !== 'object') return false;
    const metrics = value as Record<string, unknown>;
    return ['grammarImprovement', 'readabilityImprovement', 'clarityImprovement', 'repetitionReduction', 'consistencyImprovement', 'overallEstimatedImprovement', 'issuesAddressedCount', 'unresolvedIssuesCount'].every((key) => typeof metrics[key] === 'number');
  }

  private prompt(input: { content: string; scope: ImprovementScope; mode: ImprovementMode; issueIds: string[]; instruction?: string }): string {
    return `Improve the following ${input.scope.toLowerCase()} in ${input.mode.toLowerCase()} mode. Preserve factual meaning, author intent, hierarchy, and Markdown. Return JSON only with improvedContent, summary, appliedIssueIds, unresolvedIssueIds, and metrics containing grammarImprovement, readabilityImprovement, clarityImprovement, repetitionReduction, consistencyImprovement, overallEstimatedImprovement, issuesAddressedCount, unresolvedIssuesCount. Applicable issue IDs: ${JSON.stringify(input.issueIds)}. Additional instruction: ${input.instruction ?? 'none'}. Content:\n${input.content}`;
  }
}

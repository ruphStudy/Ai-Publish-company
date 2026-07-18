import type { AiProviderFactory } from '../../core/ai/ai-provider.factory';
import { ContentImprovementEngine } from './content-improvement.engine';
import { ImprovementMode, ImprovementScope } from './entities/content-improvement.entity';

describe('ContentImprovementEngine', () => {
  const output = JSON.stringify({ improvedContent: '# Improved\n\nClear content.', summary: 'Improved clarity.', appliedIssueIds: ['review:0'], unresolvedIssueIds: [], metrics: { grammarImprovement: 10, readabilityImprovement: 15, clarityImprovement: 20, repetitionReduction: 5, consistencyImprovement: 8, overallEstimatedImprovement: 14, issuesAddressedCount: 1, unresolvedIssuesCount: 0 } });

  it('uses the shared provider and parses structured responses', async () => {
    const generate = jest.fn().mockResolvedValue({ provider: 'openai', model: 'mock', content: output, requestId: 'mock-request', usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 } });
    const factory = { getOpenAi: () => ({ generate }) } as unknown as AiProviderFactory;
    const result = await new ContentImprovementEngine(factory).improve({ content: '# Original', scope: ImprovementScope.CHAPTER, mode: ImprovementMode.CLARITY, issueIds: ['review:0'] });
    expect(generate).toHaveBeenCalledTimes(1);
    expect(result.improvedContent).toBe('# Improved\n\nClear content.');
    expect(result.provider).toBe('openai');
    expect(result.tokenUsage.totalTokens).toBe(30);
  });

  it('rejects malformed provider output', () => {
    const engine = new ContentImprovementEngine({} as AiProviderFactory);
    expect(() => engine.parse('{"improvedContent":""}')).toThrow('incomplete structured output');
  });
});

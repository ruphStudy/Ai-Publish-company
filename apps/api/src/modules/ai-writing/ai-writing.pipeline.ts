import { Injectable } from '@nestjs/common';
import { AIWritingFactory } from './ai-writing.factory';
import { AIWritingEngine } from './ai-writing.engine';
import { CostCalculator } from './cost.calculator';
import { AIWritingResponseParser } from './parsers/ai-writing-response.parser';
import { AIWritingPromptBuilder } from './prompt/ai-writing-prompt.builder';
import { AIWritingProviderFactory } from './providers/ai-writing-provider.factory';
import { AIWritingRetryStrategy } from './retry/ai-writing-retry.strategy';
import { TokenUsageTracker } from './token-usage.tracker';

@Injectable()
export class AIWritingPipeline {
  constructor(
    private readonly promptBuilder: AIWritingPromptBuilder,
    private readonly providerFactory: AIWritingProviderFactory,
    private readonly retryStrategy: AIWritingRetryStrategy,
    private readonly responseParser: AIWritingResponseParser,
    private readonly writingEngine: AIWritingEngine,
    private readonly tokenUsageTracker: TokenUsageTracker,
    private readonly costCalculator: CostCalculator,
    private readonly writingFactory: AIWritingFactory,
  ) {}

  async generateChapter(
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    chapter: Record<string, unknown>,
    generatedBy?: string,
    instruction?: string,
  ) {
    const startTime = Date.now();
    const provider = this.providerFactory.getProvider();
    const prompt = this.promptBuilder.buildChapterPrompt(
      blueprint,
      outline,
      chapter,
      instruction,
    );

    const response = await this.retryStrategy.execute(() =>
      provider.generate(prompt),
    );

    const markdown = this.responseParser.parseMarkdown(response.content);
    const plainText = this.responseParser.toPlainText(markdown);
    const html = this.responseParser.toHtml(markdown);
    const chapterContent = this.writingEngine.createChapterContent(
      chapter,
      markdown,
    );
    const tokenUsage = this.tokenUsageTracker.create(response.usage);
    const estimatedCost = this.costCalculator.calculate(response.usage);

    return this.writingFactory.create(
      blueprint,
      outline,
      chapter,
      markdown,
      plainText,
      html,
      chapterContent,
      response,
      tokenUsage,
      estimatedCost,
      Date.now() - startTime,
      generatedBy,
    );
  }
}
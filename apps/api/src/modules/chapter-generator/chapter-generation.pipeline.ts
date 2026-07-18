import { Injectable } from '@nestjs/common';
import { ChapterFactory } from './chapter.factory';
import { ChapterGenerationEngine } from './chapter-generation.engine';
import { ChapterResponseParser } from './parsers/chapter-response.parser';
import { ChapterPromptBuilder } from './prompt/chapter-prompt.builder';
import { OpenAiChapterProvider } from './providers/openai-chapter.provider';
import { ChapterRetryStrategy } from './retry/chapter-retry.strategy';

@Injectable()
export class ChapterGenerationPipeline {
  constructor(
    private readonly promptBuilder: ChapterPromptBuilder,
    private readonly provider: OpenAiChapterProvider,
    private readonly retryStrategy: ChapterRetryStrategy,
    private readonly responseParser: ChapterResponseParser,
    private readonly engine: ChapterGenerationEngine,
    private readonly chapterFactory: ChapterFactory,
  ) {}

  async execute(
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    chapterOutline: Record<string, unknown>,
    chapterNumber: number,
    generatedBy?: string,
  ) {
    const prompt = this.promptBuilder.build(
      blueprint,
      outline,
      chapterOutline,
    );

    const aiResponse = await this.retryStrategy.execute(() =>
      this.provider.generate(prompt),
    );

    const parsed = this.responseParser.parse(aiResponse.content);
    const normalized = this.engine.normalize(parsed);

    return this.chapterFactory.create(
      blueprint,
      outline,
      chapterNumber,
      normalized,
      aiResponse,
      generatedBy,
    );
  }
}
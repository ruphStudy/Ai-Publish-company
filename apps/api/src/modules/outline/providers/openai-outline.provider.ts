import { Injectable } from '@nestjs/common';
import { OpenAiClientService } from '../../../core/ai/openai-client.service';
import { outlineConfig } from '../config/outline.config';
import { AiOutlineProvider, OutlineProviderRequest, OutlineProviderResponse } from '../interfaces/ai-outline-provider.interface';

@Injectable()
export class OpenAiOutlineProvider implements AiOutlineProvider {
  readonly providerName = 'openai';
  constructor(private readonly client: OpenAiClientService) {}

  async generate(request: OutlineProviderRequest): Promise<OutlineProviderResponse> {
    if (!outlineConfig.openai.apiKey && process.env.NODE_ENV !== 'production') {
      return this.generateDevelopmentOutline(request.prompt);
    }

    return this.client.generate({
      prompt: request.prompt,
      model: outlineConfig.openai.model,
      apiKey: outlineConfig.openai.apiKey,
      baseUrl: outlineConfig.openai.baseUrl,
      timeoutMs: outlineConfig.openai.timeoutMs,
    });
  }

  private generateDevelopmentOutline(prompt: string): OutlineProviderResponse {
    const titleMatch = prompt.match(/title[^A-Za-z0-9]+([^.\n]+)/i);
    const title = titleMatch?.[1]?.trim() || 'Generated Book Outline';
    const chapterCountMatch = prompt.match(/(?:chapter count|chapters|estimatedChapterCount)[^0-9]+([0-9]+)/i);
    const chapterCount = Math.min(20, Math.max(1, Number(chapterCountMatch?.[1] ?? 10)));
    const chapters = Array.from({ length: chapterCount }, (_, index) => ({
      partNumber: index < Math.ceil(chapterCount / 2) ? 1 : 2,
      partTitle: index < Math.ceil(chapterCount / 2) ? 'Foundation' : 'Execution',
      chapterNumber: index + 1,
      chapterTitle: `Chapter ${index + 1}: ${index === 0 ? 'Starting Point' : `Practical Step ${index}`}`,
      objective: `Help readers complete practical learning objective ${index + 1}.`,
      summary: `A focused chapter that turns the book strategy into an actionable reader outcome for step ${index + 1}.`,
      estimatedWordCount: 3000,
      keyTopics: ['strategy', 'execution', 'reader outcome'],
      learningOutcomes: [`Apply chapter ${index + 1} concepts to the book objective.`],
      writingInstructions: 'Use clear, practical language with examples, transitions and concise sections.',
      references: [],
    }));

    return {
      provider: 'development-mock',
      model: 'local-outline-mock',
      content: JSON.stringify({
        title,
        subtitle: 'A Practical, Structured Book Plan',
        outlineSummary: `Development outline generated locally from the approved blueprint prompt. Prompt length: ${prompt.length}.`,
        confidenceScore: 82,
        chapters,
      }),
    };
  }
}

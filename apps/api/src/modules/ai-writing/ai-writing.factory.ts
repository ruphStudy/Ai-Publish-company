import { Injectable } from '@nestjs/common';
import { aiWritingConfig } from './config/ai-writing.config';
import {
  BookContent} from './entities/book-content.entity';
import {
  ContentGenerationStatus,
} from './entities/book-content.entity';
import { ChapterContent } from './entities/chapter-content.entity';
import { AiWritingProviderResponse } from './interfaces/ai-writing-provider.interface';

@Injectable()
export class AIWritingFactory {
  create(
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    chapter: Record<string, unknown>,
    content: string,
    plainText: string,
    html: string,
    chapterContent: ChapterContent,
    response: AiWritingProviderResponse,
    tokenUsage: Record<string, number>,
    estimatedCost: number,
    generationTime: number,
    generatedBy?: string,
  ): Partial<BookContent> {
    const wordCount = plainText
      .split(/\s+/)
      .filter(Boolean).length;

    return {
      contentId: this.createContentId(Number(chapter.chapterNumber)),
      projectId: String(blueprint.projectId),
      blueprintId: String(blueprint._id ?? blueprint.id),
      outlineId: String(outline._id ?? outline.id),
      chapterId: String(chapter._id ?? chapter.id),
      chapterNumber: Number(chapter.chapterNumber),
      chapterTitle: String(chapter.chapterTitle),
      chapterContent,
      generatedContent: content,
      markdownContent: content,
      plainTextContent: plainText,
      htmlContent: html,
      estimatedReadingTime: Math.max(
        1,
        Math.ceil(
          wordCount / aiWritingConfig.generation.readingWordsPerMinute,
        ),
      ),
      generatedWordCount: wordCount,
      tokenUsage,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      estimatedCost,
      aiProvider: response.provider,
      aiModel: response.model,
      generationTime,
      promptVersion: aiWritingConfig.generation.promptVersion,
      contentVersion: aiWritingConfig.generation.contentVersion,
      confidenceScore: Math.min(
        100,
        Math.max(0, Number(chapter.confidenceScore ?? 0)),
      ),
      status: ContentGenerationStatus.GENERATED,
      metadata: {
        requestId: response.requestId,
        generatedAt: new Date().toISOString(),
        chapterVersion: chapter.chapterVersion,
        outlineVersion: outline.outlineVersion,
        blueprintVersion: blueprint.blueprintVersion,
      },
      createdBy: generatedBy,
      updatedBy: generatedBy,
    };
  }

  private createContentId(chapterNumber: number): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();

    return `CNT-${date}-${chapterNumber}-${suffix}`;
  }
}
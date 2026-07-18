import { Injectable } from '@nestjs/common';
import { BookContentDocument } from './entities/book-content.entity';

@Injectable()
export class AIWritingMapper {
  toResponse(document: BookContentDocument) {
    return {
      id: document.id,
      contentId: document.contentId,
      projectId: document.projectId,
      blueprintId: document.blueprintId,
      outlineId: document.outlineId,
      chapterId: document.chapterId,
      chapterNumber: document.chapterNumber,
      chapterTitle: document.chapterTitle,
      generatedContent: document.generatedContent,
      markdownContent: document.markdownContent,
      plainTextContent: document.plainTextContent,
      htmlContent: document.htmlContent,
      chapterContent: document.chapterContent,
      estimatedReadingTime: document.estimatedReadingTime,
      generatedWordCount: document.generatedWordCount,
      tokenUsage: document.tokenUsage,
      promptTokens: document.promptTokens,
      completionTokens: document.completionTokens,
      estimatedCost: document.estimatedCost,
      aiProvider: document.aiProvider,
      aiModel: document.aiModel,
      generationTime: document.generationTime,
      promptVersion: document.promptVersion,
      contentVersion: document.contentVersion,
      confidenceScore: document.confidenceScore,
      status: document.status,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
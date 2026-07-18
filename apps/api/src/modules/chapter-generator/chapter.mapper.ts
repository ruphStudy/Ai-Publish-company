import { Injectable } from '@nestjs/common';
import { ChapterDocument } from './entities/chapter.entity';

@Injectable()
export class ChapterMapper {
  toResponse(document: ChapterDocument) {
    return {
      id: document.id,
      chapterId: document.chapterId,
      projectId: document.projectId,
      blueprintId: document.blueprintId,
      outlineId: document.outlineId,
      chapterNumber: document.chapterNumber,
      chapterTitle: document.chapterTitle,
      objective: document.objective,
      summary: document.summary,
      introduction: document.introduction,
      conclusion: document.conclusion,
      estimatedWordCount: document.estimatedWordCount,
      estimatedReadingTime: document.estimatedReadingTime,
      writingInstructions: document.writingInstructions,
      keyConcepts: document.keyConcepts,
      examples: document.examples,
      references: document.references,
      dependencies: document.dependencies,
      sections: document.sections,
      confidenceScore: document.confidenceScore,
      aiProvider: document.aiProvider,
      aiModel: document.aiModel,
      promptVersion: document.promptVersion,
      chapterVersion: document.chapterVersion,
      status: document.status,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
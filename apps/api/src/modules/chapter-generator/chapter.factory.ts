import { Injectable } from '@nestjs/common';
import { chapterGeneratorConfig } from './config/chapter-generator.config';
import {
  ChapterSection,
  ChapterSubsection,
} from './entities/chapter-section.entity';
import { Chapter} from './entities/chapter.entity';
import { ChapterStatus } from './entities/chapter.entity';
import { GeneratedChapterBlueprint } from './parsers/chapter-response.parser';

@Injectable()
export class ChapterFactory {
  create(
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    chapterNumber: number,
    generated: GeneratedChapterBlueprint,
    ai: { provider: string; model: string },
    generatedBy?: string,
  ): Partial<Chapter> {
    const sections: ChapterSection[] = generated.sections.map((section) => ({
      ...section,
      subsections: (section.subsections ?? []) as ChapterSubsection[],
    }));

    return {
      chapterId: this.createChapterId(chapterNumber),
      projectId: String(blueprint.projectId),
      blueprintId: String(blueprint._id ?? blueprint.id),
      outlineId: String(outline._id ?? outline.id),
      chapterNumber,
      chapterTitle: generated.chapterTitle.trim(),
      objective: generated.objective.trim(),
      summary: generated.summary.trim(),
      introduction: generated.introduction.trim(),
      conclusion: generated.conclusion.trim(),
      estimatedWordCount: generated.estimatedWordCount,
      estimatedReadingTime: Math.ceil(
        generated.estimatedWordCount /
          chapterGeneratorConfig.generation.readingWordsPerMinute,
      ),
      writingInstructions: generated.writingInstructions.trim(),
      keyConcepts: generated.keyConcepts ?? [],
      examples: generated.examples ?? [],
      references: generated.references ?? [],
      dependencies: generated.dependencies ?? [],
      sections,
      confidenceScore: generated.confidenceScore,
      aiProvider: ai.provider,
      aiModel: ai.model,
      promptVersion: chapterGeneratorConfig.generation.promptVersion,
      chapterVersion: chapterGeneratorConfig.generation.chapterVersion,
      status: ChapterStatus.GENERATED,
      metadata: {
        generatedAt: new Date().toISOString(),
        outlineVersion: outline.outlineVersion,
        blueprintVersion: blueprint.blueprintVersion,
      },
      createdBy: generatedBy,
      updatedBy: generatedBy,
    };
  }

  private createChapterId(chapterNumber: number): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 9).toUpperCase();

    return `CH-${date}-${chapterNumber}-${suffix}`;
  }
}
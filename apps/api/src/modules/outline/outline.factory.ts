import { Injectable } from '@nestjs/common';
import { outlineConfig } from './config/outline.config';
import {
  ChapterOutline} from './entities/chapter-outline.entity';
import {
  ChapterOutlineStatus,
} from './entities/chapter-outline.entity';
import { Outline} from './entities/outline.entity';
import { OutlineStatus } from './entities/outline.entity';
import { GeneratedOutlinePayload } from './parsers/outline-response.parser';

@Injectable()
export class OutlineFactory {
  create(
    blueprint: Record<string, unknown>,
    generated: GeneratedOutlinePayload,
    provider: string,
    model: string,
    generatedBy?: string,
  ): Partial<Outline> {
    const chapters: ChapterOutline[] = generated.chapters.map((chapter) => ({
      ...chapter,
      status: ChapterOutlineStatus.GENERATED,
    }));

    const estimatedWordCount = chapters.reduce(
      (total, chapter) => total + chapter.estimatedWordCount,
      0,
    );

    return {
      outlineId: this.createOutlineId(),
      blueprintId: String(blueprint._id ?? blueprint.id),
      projectId: String(blueprint.projectId),
      title: generated.title.trim(),
      subtitle: generated.subtitle?.trim(),
      totalParts: new Set(chapters.map((chapter) => chapter.partNumber)).size,
      totalChapters: chapters.length,
      estimatedWordCount,
      estimatedReadingTime: Math.ceil(
        estimatedWordCount / outlineConfig.generation.readingWordsPerMinute,
      ),
      outlineSummary: generated.outlineSummary.trim(),
      chapters,
      confidenceScore: generated.confidenceScore,
      aiProvider: provider,
      aiModel: model,
      promptVersion: outlineConfig.generation.promptVersion,
      outlineVersion: outlineConfig.generation.outlineVersion,
      status: OutlineStatus.GENERATED,
      metadata: {
        blueprintVersion: blueprint.blueprintVersion,
        generatedAt: new Date().toISOString(),
      },
      createdBy: generatedBy,
      updatedBy: generatedBy,
    };
  }

  private createOutlineId(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();

    return `OUT-${date}-${suffix}`;
  }
}
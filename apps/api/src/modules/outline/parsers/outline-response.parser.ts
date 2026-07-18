import { BadRequestException, Injectable } from '@nestjs/common';

export interface GeneratedChapterOutline {
  partNumber: number;
  partTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  objective: string;
  summary: string;
  estimatedWordCount: number;
  keyTopics: string[];
  learningOutcomes: string[];
  writingInstructions: string;
  references: string[];
}

export interface GeneratedOutlinePayload {
  title: string;
  subtitle?: string;
  outlineSummary: string;
  confidenceScore: number;
  chapters: GeneratedChapterOutline[];
}

@Injectable()
export class OutlineResponseParser {
  parse(content: string): GeneratedOutlinePayload {
    const normalizedContent = content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    let parsed: unknown;

    try {
      parsed = JSON.parse(normalizedContent);
    } catch {
      throw new BadRequestException('Outline provider returned invalid JSON');
    }

    if (!this.isValidPayload(parsed)) {
      throw new BadRequestException('Outline provider returned invalid outline data');
    }

    return {
      ...parsed,
      confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore)),
      chapters: parsed.chapters
        .sort((left, right) => left.chapterNumber - right.chapterNumber)
        .map((chapter) => ({
          ...chapter,
          keyTopics: this.normalizeList(chapter.keyTopics),
          learningOutcomes: this.normalizeList(chapter.learningOutcomes),
          references: this.normalizeList(chapter.references),
        })),
    };
  }

  private isValidPayload(value: unknown): value is GeneratedOutlinePayload {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const payload = value as Record<string, unknown>;

    return (
      typeof payload.title === 'string' &&
      typeof payload.outlineSummary === 'string' &&
      typeof payload.confidenceScore === 'number' &&
      Array.isArray(payload.chapters) &&
      payload.chapters.length > 0 &&
      payload.chapters.every((chapter) => this.isValidChapter(chapter))
    );
  }

  private isValidChapter(value: unknown): value is GeneratedChapterOutline {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const chapter = value as Record<string, unknown>;

    return (
      typeof chapter.partNumber === 'number' &&
      typeof chapter.partTitle === 'string' &&
      typeof chapter.chapterNumber === 'number' &&
      typeof chapter.chapterTitle === 'string' &&
      typeof chapter.objective === 'string' &&
      typeof chapter.summary === 'string' &&
      typeof chapter.estimatedWordCount === 'number' &&
      typeof chapter.writingInstructions === 'string'
    );
  }

  private normalizeList(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return [
      ...new Set(
        value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }
}
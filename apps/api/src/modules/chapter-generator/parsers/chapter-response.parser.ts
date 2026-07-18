import { BadRequestException, Injectable } from '@nestjs/common';

export interface GeneratedChapterSubsection {
  sectionNumber: string;
  title: string;
  objective: string;
  summary: string;
  estimatedWordCount: number;
  writingInstructions: string;
  order: number;
}

export interface GeneratedChapterSection {
  sectionNumber: string;
  title: string;
  objective: string;
  summary: string;
  estimatedWordCount: number;
  writingInstructions: string;
  order: number;
  subsections?: GeneratedChapterSubsection[];
}

export interface GeneratedChapterBlueprint {
  chapterTitle: string;
  objective: string;
  summary: string;
  introduction: string;
  conclusion: string;
  estimatedWordCount: number;
  writingInstructions: string;
  keyConcepts?: string[];
  examples?: string[];
  references?: string[];
  dependencies?: number[];
  confidenceScore: number;
  sections: GeneratedChapterSection[];
}

@Injectable()
export class ChapterResponseParser {
  parse(content: string): GeneratedChapterBlueprint {
    const normalized = content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    let payload: unknown;

    try {
      payload = JSON.parse(normalized);
    } catch {
      throw new BadRequestException('Chapter provider returned invalid JSON');
    }

    if (!this.isValidPayload(payload)) {
      throw new BadRequestException(
        'Chapter provider returned invalid chapter blueprint data',
      );
    }

    return {
      ...payload,
      confidenceScore: Math.min(100, Math.max(0, payload.confidenceScore)),
      keyConcepts: this.normalizeStringList(payload.keyConcepts),
      examples: this.normalizeStringList(payload.examples),
      references: this.normalizeStringList(payload.references),
      dependencies: this.normalizeNumberList(payload.dependencies),
      sections: payload.sections
        .sort((left, right) => left.order - right.order)
        .map((section, index) => ({
          ...section,
          order: index + 1,
          subsections: (section.subsections ?? [])
            .sort((left, right) => left.order - right.order)
            .map((subsection, subsectionIndex) => ({
              ...subsection,
              order: subsectionIndex + 1,
            })),
        })),
    };
  }

  private isValidPayload(value: unknown): value is GeneratedChapterBlueprint {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const payload = value as Record<string, unknown>;

    return (
      typeof payload.chapterTitle === 'string' &&
      typeof payload.objective === 'string' &&
      typeof payload.summary === 'string' &&
      typeof payload.introduction === 'string' &&
      typeof payload.conclusion === 'string' &&
      typeof payload.estimatedWordCount === 'number' &&
      typeof payload.writingInstructions === 'string' &&
      typeof payload.confidenceScore === 'number' &&
      Array.isArray(payload.sections) &&
      payload.sections.length > 0
    );
  }

  private normalizeStringList(value: unknown): string[] {
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

  private normalizeNumberList(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return [
      ...new Set(
        value
          .filter((item): item is number => typeof item === 'number')
          .filter((item) => Number.isInteger(item) && item > 0),
      ),
    ];
  }
}
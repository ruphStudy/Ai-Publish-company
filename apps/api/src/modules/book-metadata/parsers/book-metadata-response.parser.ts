import { BadRequestException, Injectable } from '@nestjs/common';

export interface GeneratedBookMetadata {
  title: string;
  subtitle?: string;
  shortDescription: string;
  longDescription: string;
  seoDescription: string;
  amazonDescription: string;
  googleDescription: string;
  draft2digitalDescription: string;
  keywords?: string[];
  backendKeywords?: string[];
  bisacCategories?: string[];
  amazonCategories?: string[];
  googleCategories?: string[];
  language: string;
  readingLevel?: string;
  ageGroup?: string;
  edition?: string;
  authorName?: string;
  authorBiography?: string;
  publisherName?: string;
  copyrightText: string;
  isbn?: string;
  confidenceScore: number;
  publishingRecommendations?: string[];
}

@Injectable()
export class BookMetadataResponseParser {
  parse(content: string): GeneratedBookMetadata {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    let parsed: unknown;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new BadRequestException('Metadata provider returned invalid JSON');
    }

    if (!this.isValid(parsed)) {
      throw new BadRequestException(
        'Metadata provider returned incomplete metadata',
      );
    }

    return {
      ...parsed,
      confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore)),
      keywords: this.normalizeList(parsed.keywords),
      backendKeywords: this.normalizeList(parsed.backendKeywords),
      bisacCategories: this.normalizeList(parsed.bisacCategories),
      amazonCategories: this.normalizeList(parsed.amazonCategories),
      googleCategories: this.normalizeList(parsed.googleCategories),
      publishingRecommendations: this.normalizeList(
        parsed.publishingRecommendations,
      ),
    };
  }

  private isValid(value: unknown): value is GeneratedBookMetadata {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const metadata = value as Record<string, unknown>;

    return (
      typeof metadata.title === 'string' &&
      typeof metadata.shortDescription === 'string' &&
      typeof metadata.longDescription === 'string' &&
      typeof metadata.seoDescription === 'string' &&
      typeof metadata.amazonDescription === 'string' &&
      typeof metadata.googleDescription === 'string' &&
      typeof metadata.draft2digitalDescription === 'string' &&
      typeof metadata.language === 'string' &&
      typeof metadata.copyrightText === 'string' &&
      typeof metadata.confidenceScore === 'number'
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
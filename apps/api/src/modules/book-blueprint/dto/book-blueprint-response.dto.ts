import type { BookBlueprintStatus } from '../entities/book-blueprint.entity';

export class BookBlueprintResponseDto {
  id: string;
  blueprintId: string;
  projectId: string;
  marketIntelligenceId: string;
  knowledgeRecordId: string;
  classificationId: string;
  opportunityScoreId: string;
  title: string;
  subtitle: string | null;
  objective: string;
  usp: string;
  genre: string | null;
  niche: string | null;
  microNiche: string | null;
  targetAudience: string | null;
  readerPersona: string | null;
  language: string;
  writingStyle: string | null;
  tone: string | null;
  estimatedWordCount: number;
  estimatedChapterCount: number;
  targetPlatforms: string[];
  publishingStrategy: string | null;
  seoKeywords: string[];
  primaryCategory: string | null;
  secondaryCategory: string | null;
  chapterObjectives: string[];
  monetizationStrategy: string | null;
  confidenceScore: number;
  blueprintVersion: string;
  status: BookBlueprintStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedBookBlueprintResponseDto {
  data: BookBlueprintResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
import type { Types } from 'mongoose';

import type {
  BookBlueprintQueryDto,
  UpdateBookBlueprintDto,
} from '../dto';
import type { BookBlueprint } from '../entities/book-blueprint.entity';

export interface CreateBookBlueprintData {
  blueprintId: string;
  projectId: Types.ObjectId;
  marketIntelligenceId: Types.ObjectId;
  knowledgeRecordId: Types.ObjectId;
  classificationId: Types.ObjectId;
  opportunityScoreId: Types.ObjectId;
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
  status: BookBlueprint['status'];
  metadata: Record<string, unknown>;
}

export interface PaginatedBookBlueprintResult {
  data: BookBlueprint[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BookBlueprintRepositoryInterface {
  create(data: CreateBookBlueprintData, userId: Types.ObjectId): Promise<BookBlueprint>;
  update(
    id: string,
    data: UpdateBookBlueprintDto,
    userId: Types.ObjectId,
  ): Promise<BookBlueprint | null>;
  delete(id: string, userId: Types.ObjectId): Promise<boolean>;
  softDelete(id: string, userId: Types.ObjectId): Promise<boolean>;
  restore(id: string): Promise<BookBlueprint | null>;
  findById(id: string): Promise<BookBlueprint | null>;
  findByProjectId(projectId: string): Promise<BookBlueprint[]>;
  latestBlueprint(projectId: string): Promise<BookBlueprint | null>;
  search(query: BookBlueprintQueryDto): Promise<PaginatedBookBlueprintResult>;
  paginate(query: BookBlueprintQueryDto): Promise<PaginatedBookBlueprintResult>;
  existsByBlueprintId(blueprintId: string): Promise<boolean>;
}
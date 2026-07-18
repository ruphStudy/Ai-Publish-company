import type {
  BookProjectStage,
  BookProjectStatus,
} from '../entities/book-project.entity';

export class BookProjectResponseDto {
  id: string;
  projectCode: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  categoryId: string;
  subCategoryId: string | null;
  niche: string | null;
  microNiche: string | null;
  language: string;
  targetMarket: string;
  targetAudience: string | null;
  writingStyle: string | null;
  tone: string | null;
  objective: string | null;
  estimatedWordCount: number | null;
  estimatedChapterCount: number | null;
  targetPlatforms: string[];
  aiModel: string | null;
  status: BookProjectStatus;
  progress: number;
  currentStage: BookProjectStage;
  ownerId: string;
  tags: string[];
  metadata: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedBookProjectResponseDto {
  data: BookProjectResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
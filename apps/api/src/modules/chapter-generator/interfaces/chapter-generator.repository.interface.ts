import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { Chapter, ChapterDocument } from '../entities/chapter.entity';

export interface PaginatedChapterResult {
  items: ChapterDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChapterGeneratorRepositoryInterface {
  create(data: Partial<Chapter>): Promise<ChapterDocument>;
  update(
    id: string,
    data: UpdateQuery<Chapter>,
  ): Promise<ChapterDocument | null>;
  findById(id: string): Promise<ChapterDocument | null>;
  findByProjectId(projectId: string): Promise<ChapterDocument[]>;
  findByOutlineId(outlineId: string): Promise<ChapterDocument[]>;
  latestChapter(
    outlineId: string,
    chapterNumber: number,
  ): Promise<ChapterDocument | null>;
  search(
    filter: FilterQuery<Chapter>,
    page: number,
    limit: number,
  ): Promise<PaginatedChapterResult>;
  exists(filter: FilterQuery<Chapter>): Promise<boolean>;
  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<ChapterDocument | null>;
  restore(id: string): Promise<ChapterDocument | null>;
}
import type { FilterQuery, UpdateQuery } from 'mongoose';
import type {
  BookContent,
  BookContentDocument,
} from '../entities/book-content.entity';

export interface PaginatedContentResult {
  items: BookContentDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AIWritingRepositoryInterface {
  create(data: Partial<BookContent>): Promise<BookContentDocument>;
  update(
    id: string,
    data: UpdateQuery<BookContent>,
  ): Promise<BookContentDocument | null>;
  findById(id: string): Promise<BookContentDocument | null>;
  findByProjectId(projectId: string): Promise<BookContentDocument[]>;
  findByChapterId(chapterId: string): Promise<BookContentDocument[]>;
  latestVersion(chapterId: string): Promise<BookContentDocument | null>;
  search(
    filter: FilterQuery<BookContent>,
    page: number,
    limit: number,
  ): Promise<PaginatedContentResult>;
  exists(filter: FilterQuery<BookContent>): Promise<boolean>;
  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<BookContentDocument | null>;
  restore(id: string): Promise<BookContentDocument | null>;
}
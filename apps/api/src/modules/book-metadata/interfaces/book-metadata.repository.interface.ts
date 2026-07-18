import type { FilterQuery, UpdateQuery } from 'mongoose';
import type {
  BookMetadata,
  BookMetadataDocument,
} from '../entities/book-metadata.entity';

export interface PaginatedBookMetadataResult {
  items: BookMetadataDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookMetadataRepositoryInterface {
  create(data: Partial<BookMetadata>): Promise<BookMetadataDocument>;
  update(
    id: string,
    data: UpdateQuery<BookMetadata>,
  ): Promise<BookMetadataDocument | null>;
  findById(id: string): Promise<BookMetadataDocument | null>;
  findByProjectId(projectId: string): Promise<BookMetadataDocument[]>;
  latestMetadata(projectId: string): Promise<BookMetadataDocument | null>;
  search(
    filter: FilterQuery<BookMetadata>,
    page: number,
    limit: number,
  ): Promise<PaginatedBookMetadataResult>;
  exists(filter: FilterQuery<BookMetadata>): Promise<boolean>;
  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<BookMetadataDocument | null>;
  restore(id: string): Promise<BookMetadataDocument | null>;
}
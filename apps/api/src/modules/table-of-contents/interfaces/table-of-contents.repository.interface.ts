import type { FilterQuery, UpdateQuery } from 'mongoose';
import type {
  TableOfContents,
  TableOfContentsDocument,
} from '../entities/table-of-contents.entity';

export interface PaginatedTableOfContentsResult {
  items: TableOfContentsDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TableOfContentsRepositoryInterface {
  create(data: Partial<TableOfContents>): Promise<TableOfContentsDocument>;
  update(
    id: string,
    data: UpdateQuery<TableOfContents>,
  ): Promise<TableOfContentsDocument | null>;
  findById(id: string): Promise<TableOfContentsDocument | null>;
  findByProjectId(projectId: string): Promise<TableOfContentsDocument[]>;
  latestTOC(projectId: string): Promise<TableOfContentsDocument | null>;
  search(
    filter: FilterQuery<TableOfContents>,
    page: number,
    limit: number,
  ): Promise<PaginatedTableOfContentsResult>;
  exists(filter: FilterQuery<TableOfContents>): Promise<boolean>;
  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<TableOfContentsDocument | null>;
  restore(id: string): Promise<TableOfContentsDocument | null>;
}
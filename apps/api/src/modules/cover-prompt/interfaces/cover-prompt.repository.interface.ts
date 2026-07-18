import type { FilterQuery, UpdateQuery } from 'mongoose';
import type {
  CoverPrompt,
  CoverPromptDocument,
} from '../entities/cover-prompt.entity';

export interface PaginatedCoverPromptResult {
  items: CoverPromptDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CoverPromptRepositoryInterface {
  create(data: Partial<CoverPrompt>): Promise<CoverPromptDocument>;
  update(
    id: string,
    data: UpdateQuery<CoverPrompt>,
  ): Promise<CoverPromptDocument | null>;
  findById(id: string): Promise<CoverPromptDocument | null>;
  findByProjectId(projectId: string): Promise<CoverPromptDocument[]>;
  latestPrompt(projectId: string): Promise<CoverPromptDocument | null>;
  search(
    filter: FilterQuery<CoverPrompt>,
    page: number,
    limit: number,
  ): Promise<PaginatedCoverPromptResult>;
  exists(filter: FilterQuery<CoverPrompt>): Promise<boolean>;
  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<CoverPromptDocument | null>;
  restore(id: string): Promise<CoverPromptDocument | null>;
}
import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { Outline, OutlineDocument } from '../entities/outline.entity';

export interface PaginatedOutlineResult {
  items: OutlineDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OutlineRepositoryInterface {
  create(data: Partial<Outline>): Promise<OutlineDocument>;
  update(
    id: string,
    data: UpdateQuery<Outline>,
  ): Promise<OutlineDocument | null>;
  findById(id: string): Promise<OutlineDocument | null>;
  findByBlueprintId(blueprintId: string): Promise<OutlineDocument[]>;
  latestOutline(blueprintId: string): Promise<OutlineDocument | null>;
  search(
    filter: FilterQuery<Outline>,
    page: number,
    limit: number,
  ): Promise<PaginatedOutlineResult>;
  exists(filter: FilterQuery<Outline>): Promise<boolean>;
  softDelete(id: string, deletedBy?: string): Promise<OutlineDocument | null>;
  restore(id: string): Promise<OutlineDocument | null>;
}
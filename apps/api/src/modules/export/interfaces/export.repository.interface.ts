import type { FilterQuery, UpdateQuery } from 'mongoose';
import type {
  ExportJob,
  ExportJobDocument,
} from '../entities/export-job.entity';

export interface ExportRepositoryInterface {
  create(data: Partial<ExportJob>): Promise<ExportJobDocument>;
  update(
    id: string,
    data: UpdateQuery<ExportJob>,
  ): Promise<ExportJobDocument | null>;
  findById(id: string): Promise<ExportJobDocument | null>;
  softDelete(id: string, deletedBy?: string): Promise<ExportJobDocument | null>;
  restore(id: string): Promise<ExportJobDocument | null>;
  findByProjectId(projectId: string): Promise<ExportJobDocument[]>;
  latestExport(projectId: string): Promise<ExportJobDocument | null>;
  search(
    filter: FilterQuery<ExportJob>,
    page: number,
    limit: number,
  ): Promise<{
    items: ExportJobDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  exists(filter: FilterQuery<ExportJob>): Promise<boolean>;
}

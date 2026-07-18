import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { ContentImprovement, ContentImprovementDocument, ImprovementTargetType } from '../entities/content-improvement.entity';
export interface PaginatedContentImprovementResult { items: ContentImprovementDocument[]; total: number; page: number; limit: number; totalPages: number }
export interface ContentImprovementRepositoryInterface {
  create(data: Partial<ContentImprovement>): Promise<ContentImprovementDocument>;
  update(id: string, data: UpdateQuery<ContentImprovement>): Promise<ContentImprovementDocument | null>;
  findById(id: string): Promise<ContentImprovementDocument | null>;
  findByProjectId(projectId: string): Promise<ContentImprovementDocument[]>;
  findByTarget(targetType: ImprovementTargetType, targetId: string): Promise<ContentImprovementDocument[]>;
  findByQualityReviewId(qualityReviewId: string): Promise<ContentImprovementDocument[]>;
  findLatestByTarget(targetType: ImprovementTargetType, targetId: string): Promise<ContentImprovementDocument | null>;
  search(filter: FilterQuery<ContentImprovement>, page: number, limit: number): Promise<PaginatedContentImprovementResult>;
  paginate(filter: FilterQuery<ContentImprovement>, page: number, limit: number): Promise<PaginatedContentImprovementResult>;
  softDelete(id: string, deletedBy?: string): Promise<ContentImprovementDocument | null>;
  restore(id: string): Promise<ContentImprovementDocument | null>;
}

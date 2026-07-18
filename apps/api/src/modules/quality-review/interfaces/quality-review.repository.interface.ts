import type { FilterQuery, UpdateQuery } from 'mongoose';
import type { QualityReview, QualityReviewDocument } from '../entities/quality-review.entity';

export interface PaginatedQualityReviewResult {
  items: QualityReviewDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QualityReviewRepositoryInterface {
  create(data: Partial<QualityReview>): Promise<QualityReviewDocument>;
  update(id: string, data: UpdateQuery<QualityReview>): Promise<QualityReviewDocument | null>;
  findById(id: string): Promise<QualityReviewDocument | null>;
  findByProjectId(projectId: string): Promise<QualityReviewDocument[]>;
  latestReview(projectId: string): Promise<QualityReviewDocument | null>;
  search(filter: FilterQuery<QualityReview>, page: number, limit: number): Promise<PaginatedQualityReviewResult>;
  paginate(filter: FilterQuery<QualityReview>, page: number, limit: number): Promise<PaginatedQualityReviewResult>;
}

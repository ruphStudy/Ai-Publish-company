import { Types } from 'mongoose';

import { OpportunityScoreQueryDto } from '../dto';
import { OpportunityScore } from '../entities/opportunity-score.entity';
import { OpportunityScoreResult } from '../models/opportunity-score.model';

export interface OpportunityScoringAuditContext {
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface PaginatedOpportunityScoreResult {
  data: OpportunityScore[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OpportunityScoringRepositoryInterface {
  create(
    knowledgeId: Types.ObjectId,
    classificationId: Types.ObjectId,
    result: OpportunityScoreResult,
    audit?: OpportunityScoringAuditContext,
  ): Promise<OpportunityScore>;
  upsert(
    knowledgeId: Types.ObjectId,
    classificationId: Types.ObjectId,
    result: OpportunityScoreResult,
    audit?: OpportunityScoringAuditContext,
  ): Promise<OpportunityScore>;
  findById(id: string): Promise<OpportunityScore | null>;
  findByKnowledgeId(
    knowledgeId: string,
    includeDeleted?: boolean,
  ): Promise<OpportunityScore | null>;
  findByClassificationId(
    classificationId: string,
    includeDeleted?: boolean,
  ): Promise<OpportunityScore | null>;
  findAll(
    query: OpportunityScoreQueryDto,
  ): Promise<PaginatedOpportunityScoreResult>;
  softDelete(id: string, deletedBy?: Types.ObjectId): Promise<boolean>;
  restore(id: string, restoredBy?: Types.ObjectId): Promise<OpportunityScore | null>;
  existsByKnowledgeId(knowledgeId: string): Promise<boolean>;
}
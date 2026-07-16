import { Types } from 'mongoose';

import { AIClassificationQueryDto } from '../dto/ai-classification-query.dto';
import { AIClassification } from '../entities/ai-classification.entity';
import { ClassificationResult } from '../models/classification-result.model';

export interface AIClassificationAuditContext {
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface PaginatedAIClassificationResult {
  data: AIClassification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AIClassificationRepositoryInterface {
  create(
    knowledgeId: Types.ObjectId,
    result: ClassificationResult,
    audit?: AIClassificationAuditContext,
  ): Promise<AIClassification>;
  upsert(
    knowledgeId: Types.ObjectId,
    result: ClassificationResult,
    audit?: AIClassificationAuditContext,
  ): Promise<AIClassification>;
  findById(id: string): Promise<AIClassification | null>;
  findByKnowledgeId(
    knowledgeId: string,
    includeDeleted?: boolean,
  ): Promise<AIClassification | null>;
  findAll(query: AIClassificationQueryDto): Promise<PaginatedAIClassificationResult>;
  softDelete(id: string, deletedBy?: Types.ObjectId): Promise<boolean>;
  restore(id: string, restoredBy?: Types.ObjectId): Promise<AIClassification | null>;
  existsByKnowledgeId(knowledgeId: string): Promise<boolean>;
}
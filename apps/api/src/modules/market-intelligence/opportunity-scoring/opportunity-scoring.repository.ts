import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { OpportunityScoreQueryDto } from './dto';
import { OpportunityScore } from './entities/opportunity-score.entity';
import {
  OpportunityScoringAuditContext,
  OpportunityScoringRepositoryInterface,
  PaginatedOpportunityScoreResult,
} from './interfaces/opportunity-scoring.repository.interface';
import { OpportunityScoreResult } from './models/opportunity-score.model';

const PROJECTION = '-isDeleted -deletedAt -deletedBy -createdBy -updatedBy -__v' as const;

@Injectable()
export class OpportunityScoringRepository
  implements OpportunityScoringRepositoryInterface
{
  constructor(
    @InjectModel(OpportunityScore.name)
    private readonly model: Model<OpportunityScore>,
  ) {}

  async create(
    knowledgeId: Types.ObjectId,
    classificationId: Types.ObjectId,
    result: OpportunityScoreResult,
    audit?: OpportunityScoringAuditContext,
  ): Promise<OpportunityScore> {
    const record = new this.model({
      knowledgeId,
      classificationId,
      ...result,
      createdBy: audit?.createdBy ?? null,
      updatedBy: audit?.updatedBy ?? null,
    });

    return record.save();
  }

  async upsert(
    knowledgeId: Types.ObjectId,
    classificationId: Types.ObjectId,
    result: OpportunityScoreResult,
    audit?: OpportunityScoringAuditContext,
  ): Promise<OpportunityScore> {
    return this.model
      .findOneAndUpdate(
        { knowledgeId },
        {
          $set: {
            classificationId,
            ...result,
            ...(audit?.updatedBy ? { updatedBy: audit.updatedBy } : {}),
          },
          $setOnInsert: {
            createdBy: audit?.createdBy ?? null,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .select(PROJECTION)
      .lean()
      .exec() as unknown as OpportunityScore;
  }

  async findById(id: string): Promise<OpportunityScore | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as OpportunityScore | null;
  }

  async findByKnowledgeId(
    knowledgeId: string,
    includeDeleted = false,
  ): Promise<OpportunityScore | null> {
    if (!Types.ObjectId.isValid(knowledgeId)) {
      return null;
    }

    return this.model
      .findOne({ knowledgeId: new Types.ObjectId(knowledgeId) })
      .setOptions({ includeDeleted })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as OpportunityScore | null;
  }

  async findByClassificationId(
    classificationId: string,
    includeDeleted = false,
  ): Promise<OpportunityScore | null> {
    if (!Types.ObjectId.isValid(classificationId)) {
      return null;
    }

    return this.model
      .findOne({ classificationId: new Types.ObjectId(classificationId) })
      .setOptions({ includeDeleted })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as OpportunityScore | null;
  }

  async findAll(
    query: OpportunityScoreQueryDto,
  ): Promise<PaginatedOpportunityScoreResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'overallScore';
    const sortOrder = query.sortOrder ?? 'desc';
    const filter = this.buildFilter(query);
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(PROJECTION)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as OpportunityScore[],
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async softDelete(id: string, deletedBy?: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await this.model
      .updateOne(
        { _id: new Types.ObjectId(id) },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedBy ?? null,
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async restore(
    id: string,
    restoredBy?: Types.ObjectId,
  ): Promise<OpportunityScore | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          ...(restoredBy ? { updatedBy: restoredBy } : {}),
        },
        { new: true },
      )
      .setOptions({ includeDeleted: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as OpportunityScore | null;
  }

  async existsByKnowledgeId(knowledgeId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(knowledgeId)) {
      return false;
    }

    return (
      (await this.model.countDocuments({ knowledgeId: new Types.ObjectId(knowledgeId) }).exec()) >
      0
    );
  }

  private buildFilter(
    query: OpportunityScoreQueryDto,
  ): FilterQuery<OpportunityScore> {
    const filter: FilterQuery<OpportunityScore> = {};

    if (query.opportunityGrade) {
      filter.opportunityGrade = query.opportunityGrade;
    }

    if (query.recommendation) {
      filter.recommendation = query.recommendation;
    }

    if (
      query.minOverallScore !== undefined ||
      query.maxOverallScore !== undefined
    ) {
      filter.overallScore = {};

      if (query.minOverallScore !== undefined) {
        filter.overallScore.$gte = query.minOverallScore;
      }

      if (query.maxOverallScore !== undefined) {
        filter.overallScore.$lte = query.maxOverallScore;
      }
    }

    if (
      query.minConfidenceScore !== undefined ||
      query.maxConfidenceScore !== undefined
    ) {
      filter.confidenceScore = {};

      if (query.minConfidenceScore !== undefined) {
        filter.confidenceScore.$gte = query.minConfidenceScore;
      }

      if (query.maxConfidenceScore !== undefined) {
        filter.confidenceScore.$lte = query.maxConfidenceScore;
      }
    }

    return filter;
  }
}
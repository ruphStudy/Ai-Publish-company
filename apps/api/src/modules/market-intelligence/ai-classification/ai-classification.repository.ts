import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AIClassificationQueryDto } from './dto';
import { AIClassification } from './entities/ai-classification.entity';
import {
  AIClassificationAuditContext,
  AIClassificationRepositoryInterface,
  PaginatedAIClassificationResult,
} from './interfaces/ai-classification.repository.interface';
import { ClassificationResult } from './models/classification-result.model';

const PROJECTION = '-isDeleted -deletedAt -deletedBy -createdBy -updatedBy -__v' as const;

@Injectable()
export class AIClassificationRepository
  implements AIClassificationRepositoryInterface
{
  constructor(
    @InjectModel(AIClassification.name)
    private readonly model: Model<AIClassification>,
  ) {}

  async create(
    knowledgeId: Types.ObjectId,
    result: ClassificationResult,
    audit?: AIClassificationAuditContext,
  ): Promise<AIClassification> {
    const record = new this.model({
      knowledgeId,
      ...result,
      createdBy: audit?.createdBy ?? null,
      updatedBy: audit?.updatedBy ?? null,
    });

    return record.save();
  }

  async upsert(
    knowledgeId: Types.ObjectId,
    result: ClassificationResult,
    audit?: AIClassificationAuditContext,
  ): Promise<AIClassification> {
    return this.model
      .findOneAndUpdate(
        { knowledgeId },
        {
          $set: {
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
      .exec() as unknown as AIClassification;
  }

  async findById(id: string): Promise<AIClassification | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as AIClassification | null;
  }

  async findByKnowledgeId(
    knowledgeId: string,
    includeDeleted = false,
  ): Promise<AIClassification | null> {
    if (!Types.ObjectId.isValid(knowledgeId)) {
      return null;
    }

    return this.model
      .findOne({ knowledgeId: new Types.ObjectId(knowledgeId) })
      .setOptions({ includeDeleted })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as AIClassification | null;
  }

  async findAll(
    query: AIClassificationQueryDto,
  ): Promise<PaginatedAIClassificationResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'classifiedAt';
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
      data: data as unknown as AIClassification[],
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
  ): Promise<AIClassification | null> {
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
      .exec() as unknown as AIClassification | null;
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
    query: AIClassificationQueryDto,
  ): FilterQuery<AIClassification> {
    const filter: FilterQuery<AIClassification> = {};

    if (query.primaryCategory) {
      filter.primaryCategory = query.primaryCategory;
    }

    if (query.niche) {
      filter.niche = query.niche;
    }

    if (query.demandLevel) {
      filter.demandLevel = query.demandLevel;
    }

    if (query.competitionLevel) {
      filter.competitionLevel = query.competitionLevel;
    }

    if (query.marketMaturity) {
      filter.marketMaturity = query.marketMaturity;
    }

    if (query.topicType) {
      filter.topicType = query.topicType;
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
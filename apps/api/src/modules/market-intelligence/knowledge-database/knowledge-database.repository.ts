import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import type { DataSourceProvider } from '../entities/market-intelligence.entity';
import { MarketKnowledgeQueryDto } from './dto';
import { MarketKnowledge } from './entities/market-knowledge.entity';
import { KnowledgeDatabaseFactory } from './knowledge-database.factory';
import {
  KnowledgeDatabaseAuditContext,
  KnowledgeDatabaseRepositoryInterface,
  MarketKnowledgePersistenceData,
  PaginatedKnowledgeResult,
} from './interfaces/knowledge-database.repository.interface';

const PROJECTION = '-isDeleted -deletedAt -deletedBy -createdBy -updatedBy -__v' as const;

@Injectable()
export class KnowledgeDatabaseRepository
  implements KnowledgeDatabaseRepositoryInterface
{
  constructor(
    @InjectModel(MarketKnowledge.name)
    private readonly model: Model<MarketKnowledge>,
    private readonly factory: KnowledgeDatabaseFactory,
  ) {}

  async create(
    data: MarketKnowledgePersistenceData,
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge> {
    const record = new this.model({
      ...data,
      createdBy: audit?.createdBy ?? null,
      updatedBy: audit?.updatedBy ?? null,
    });

    return record.save();
  }

  async createMany(
    data: MarketKnowledgePersistenceData[],
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge[]> {
    const records = await this.model.insertMany(
      data.map((item) => ({
        ...item,
        createdBy: audit?.createdBy ?? null,
        updatedBy: audit?.updatedBy ?? null,
      })),
      { ordered: true },
    );

    return records;
  }

  async upsert(
    data: MarketKnowledgePersistenceData,
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge> {
    const operation = this.factory.createUpsertOperation(
      data,
      audit?.createdBy,
      audit?.updatedBy,
    );

    return this.model
      .findOneAndUpdate(
        operation.filter,
        operation.update,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MarketKnowledge;
  }

  async upsertMany(
    data: MarketKnowledgePersistenceData[],
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge[]> {
    return Promise.all(data.map((item) => this.upsert(item, audit)));
  }

  async update(
    id: string,
    data: Partial<MarketKnowledgePersistenceData>,
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const update = {
      ...data,
      ...(audit?.updatedBy ? { updatedBy: audit.updatedBy } : {}),
    };

    return this.model
      .findByIdAndUpdate(id, update, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MarketKnowledge | null;
  }

  async delete(id: string, deletedBy?: Types.ObjectId): Promise<boolean> {
    return this.softDelete(id, deletedBy);
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
  ): Promise<MarketKnowledge | null> {
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
      .exec() as unknown as MarketKnowledge | null;
  }

  async findById(id: string): Promise<MarketKnowledge | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MarketKnowledge | null;
  }

  async findByExternalId(
    provider: DataSourceProvider,
    externalId: string,
    includeDeleted = false,
  ): Promise<MarketKnowledge | null> {
    return this.model
      .findOne({ provider, externalId })
      .setOptions({ includeDeleted })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MarketKnowledge | null;
  }

  async search(query: MarketKnowledgeQueryDto): Promise<PaginatedKnowledgeResult> {
    return this.findAll(query);
  }

  async filter(query: MarketKnowledgeQueryDto): Promise<PaginatedKnowledgeResult> {
    return this.findAll(query);
  }

  async paginate(query: MarketKnowledgeQueryDto): Promise<PaginatedKnowledgeResult> {
    return this.findAll(query);
  }

  async exists(
    provider: DataSourceProvider,
    externalId: string,
  ): Promise<boolean> {
    return (
      (await this.model.countDocuments({ provider, externalId }).exec()) > 0
    );
  }

  async count(query?: MarketKnowledgeQueryDto): Promise<number> {
    return this.model.countDocuments(this.buildFilter(query ?? {})).exec();
  }

  private async findAll(
    query: MarketKnowledgeQueryDto,
  ): Promise<PaginatedKnowledgeResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'updatedAt';
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
      data: data as unknown as MarketKnowledge[],
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

  private buildFilter(
    query: Partial<MarketKnowledgeQueryDto>,
  ): FilterQuery<MarketKnowledge> {
    const filter: FilterQuery<MarketKnowledge> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.provider) {
      filter.provider = query.provider;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.subCategory) {
      filter.subCategory = query.subCategory;
    }

    if (query.language) {
      filter.language = query.language;
    }

    if (
      query.minTrendScore !== undefined ||
      query.maxTrendScore !== undefined
    ) {
      filter.trendScore = {};

      if (query.minTrendScore !== undefined) {
        filter.trendScore.$gte = query.minTrendScore;
      }

      if (query.maxTrendScore !== undefined) {
        filter.trendScore.$lte = query.maxTrendScore;
      }
    }

    if (query.minRating !== undefined || query.maxRating !== undefined) {
      filter.rating = {};

      if (query.minRating !== undefined) {
        filter.rating.$gte = query.minRating;
      }

      if (query.maxRating !== undefined) {
        filter.rating.$lte = query.maxRating;
      }
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};

      if (query.minPrice !== undefined) {
        filter.price.$gte = query.minPrice;
      }

      if (query.maxPrice !== undefined) {
        filter.price.$lte = query.maxPrice;
      }
    }

    if (query.publishDateFrom || query.publishDateTo) {
      filter.publishDate = {};

      if (query.publishDateFrom) {
        filter.publishDate.$gte = new Date(query.publishDateFrom);
      }

      if (query.publishDateTo) {
        filter.publishDate.$lte = new Date(query.publishDateTo);
      }
    }

    if (query.collectedAfter || query.collectedBefore) {
      filter.collectedAt = {};

      if (query.collectedAfter) {
        filter.collectedAt.$gte = new Date(query.collectedAfter);
      }

      if (query.collectedBefore) {
        filter.collectedAt.$lte = new Date(query.collectedBefore);
      }
    }

    return filter;
  }
}
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import { MarketIntelligence } from './entities/market-intelligence.entity';
import {
  CreateMarketIntelligenceDto,
  UpdateMarketIntelligenceDto,
  MarketIntelligenceQueryDto,
} from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const PROJECTION = '-isDeleted -deletedAt -deletedBy -rawData -__v' as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class MarketIntelligenceRepository {
  constructor(
    @InjectModel(MarketIntelligence.name)
    private readonly model: Model<MarketIntelligence>,
  ) {}

  async create(
    data: CreateMarketIntelligenceDto & { slug: string },
    userId: Types.ObjectId,
  ): Promise<MarketIntelligence> {
    const record = new this.model({ ...data, createdBy: userId });
    return record.save();
  }

  async findAll(query: MarketIntelligenceQueryDto): Promise<PaginatedResult<MarketIntelligence>> {
    const {
      search,
      source,
      dataType,
      status,
      language,
      market,
      minScore,
      maxScore,
      createdAfter,
      createdBefore,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const filter: FilterQuery<MarketIntelligence> = {};

    if (search) filter.$text = { $search: search };
    if (source !== undefined) filter.source = source;
    if (dataType !== undefined) filter.dataType = dataType;
    if (status !== undefined) filter.status = status;
    if (language !== undefined) filter.language = language;
    if (market !== undefined) filter.market = market;

    if (minScore !== undefined || maxScore !== undefined) {
      filter.opportunityScore = {};
      if (minScore !== undefined) filter.opportunityScore.$gte = minScore;
      if (maxScore !== undefined) filter.opportunityScore.$lte = maxScore;
    }

    if (createdAfter !== undefined || createdBefore !== undefined) {
      filter.createdAt = {};
      if (createdAfter !== undefined) filter.createdAt.$gte = new Date(createdAfter);
      if (createdBefore !== undefined) filter.createdAt.$lte = new Date(createdBefore);
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).select(PROJECTION).lean().exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as MarketIntelligence[],
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findById(id: string): Promise<MarketIntelligence | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).select(PROJECTION).lean().exec() as unknown as MarketIntelligence | null;
  }

  async findBySlug(slug: string): Promise<MarketIntelligence | null> {
    return this.model.findOne({ slug }).select(PROJECTION).lean().exec() as unknown as MarketIntelligence | null;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<MarketIntelligence> = { slug };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.model.countDocuments(filter).exec()) > 0;
  }

  async existsByTitle(title: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<MarketIntelligence> = {
      title: new RegExp(`^${escapeRegex(title)}$`, 'i'),
    };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.model.countDocuments(filter).exec()) > 0;
  }

  async update(
    id: string,
    data: UpdateMarketIntelligenceDto & { slug?: string },
    userId: Types.ObjectId,
  ): Promise<MarketIntelligence | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model
      .findByIdAndUpdate(id, { ...data, updatedBy: userId }, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MarketIntelligence | null;
  }

  async softDelete(id: string, userId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.model
      .updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date(), deletedBy: userId })
      .exec();
    return result.modifiedCount > 0;
  }

  async restore(id: string): Promise<MarketIntelligence | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: false, deletedAt: null, deletedBy: null },
        { new: true },
      )
      .setOptions({ includeDeleted: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MarketIntelligence | null;
  }
}

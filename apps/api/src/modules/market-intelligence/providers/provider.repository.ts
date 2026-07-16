import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { ProviderRegistration } from './entities/provider-registration.entity';
import { CreateProviderRegistrationDto, UpdateProviderRegistrationDto, ProviderQueryDto } from './dto';
import { ProviderStatus } from './interfaces/provider.interface';

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

const PROJECTION = '-isDeleted -deletedAt -deletedBy -__v' as const;

@Injectable()
export class ProviderRepository {
  constructor(
    @InjectModel(ProviderRegistration.name)
    private readonly model: Model<ProviderRegistration>,
  ) {}

  async create(data: CreateProviderRegistrationDto, userId: Types.ObjectId): Promise<ProviderRegistration> {
    const reg = new this.model({ ...data, createdBy: userId });
    return reg.save();
  }

  async findAll(query: ProviderQueryDto): Promise<PaginatedResult<ProviderRegistration>> {
    const { provider, status, isEnabled, sortBy = 'priority', sortOrder = 'asc', page = 1, limit = 20 } = query;

    const filter: FilterQuery<ProviderRegistration> = {};
    if (provider !== undefined) filter.provider = provider;
    if (status !== undefined) filter.status = status;
    if (isEnabled !== undefined) filter.isEnabled = isEnabled;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).select(PROJECTION).lean().exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: data as unknown as ProviderRegistration[],
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findByKey(key: string): Promise<ProviderRegistration | null> {
    return this.model.findOne({ key }).select(PROJECTION).lean().exec() as unknown as ProviderRegistration | null;
  }

  async findById(id: string): Promise<ProviderRegistration | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).select(PROJECTION).lean().exec() as unknown as ProviderRegistration | null;
  }

  async existsByKey(key: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<ProviderRegistration> = { key };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.model.countDocuments(filter).exec()) > 0;
  }

  async update(key: string, data: UpdateProviderRegistrationDto, userId: Types.ObjectId): Promise<ProviderRegistration | null> {
    return this.model
      .findOneAndUpdate({ key }, { ...data, updatedBy: userId }, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as ProviderRegistration | null;
  }

  async setEnabled(key: string, isEnabled: boolean, userId: Types.ObjectId): Promise<ProviderRegistration | null> {
    const status = isEnabled ? ProviderStatus.ACTIVE : ProviderStatus.INACTIVE;
    return this.model
      .findOneAndUpdate({ key }, { isEnabled, status, updatedBy: userId }, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as ProviderRegistration | null;
  }

  async updateHealthResult(
    key: string,
    result: { isAvailable: boolean; latencyMs: number | null; error: string | null },
  ): Promise<void> {
    await this.model.updateOne(
      { key },
      {
        lastHealthCheckAt: new Date(),
        lastHealthStatus: result.isAvailable,
        lastHealthLatencyMs: result.latencyMs,
        lastHealthError: result.error,
        ...(result.isAvailable ? { status: ProviderStatus.ACTIVE } : {}),
      },
    ).exec();
  }

  async softDelete(key: string, userId: Types.ObjectId): Promise<boolean> {
    const result = await this.model
      .updateOne({ key }, { isDeleted: true, deletedAt: new Date(), deletedBy: userId, isEnabled: false })
      .exec();
    return result.modifiedCount > 0;
  }
}

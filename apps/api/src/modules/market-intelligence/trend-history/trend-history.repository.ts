import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import type { TrendHistoryQueryDto } from './dto';
import { TrendHistory } from './entities/trend-history.entity';
import {
  PaginatedTrendHistoryResult,
  TrendHistoryAuditContext,
  TrendHistoryRepositoryInterface,
} from './interfaces/trend-history.repository.interface';
import {
  HistoricalStatisticsResult,
  TrendSnapshotData,
} from './models/trend-history.model';

const PROJECTION = '-isDeleted -deletedAt -deletedBy -createdBy -__v' as const;

@Injectable()
export class TrendHistoryRepository implements TrendHistoryRepositoryInterface {
  constructor(
    @InjectModel(TrendHistory.name)
    private readonly model: Model<TrendHistory>,
  ) {}

  async createSnapshot(
    snapshot: TrendSnapshotData,
    audit?: TrendHistoryAuditContext,
  ): Promise<TrendHistory> {
    const record = new this.model({
      ...snapshot,
      knowledgeRecordId: new Types.ObjectId(snapshot.knowledgeRecordId),
      createdBy: audit?.createdBy ?? null,
    });

    return record.save();
  }

  async createBulkSnapshots(
    snapshots: TrendSnapshotData[],
    audit?: TrendHistoryAuditContext,
  ): Promise<TrendHistory[]> {
    return this.model.insertMany(
      snapshots.map((snapshot) => ({
        ...snapshot,
        knowledgeRecordId: new Types.ObjectId(snapshot.knowledgeRecordId),
        createdBy: audit?.createdBy ?? null,
      })),
      { ordered: true },
    );
  }

  async findHistory(
    knowledgeRecordId: string,
    query: TrendHistoryQueryDto,
  ): Promise<PaginatedTrendHistoryResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'snapshotDate';
    const sortOrder = query.sortOrder ?? 'desc';
    const filter = this.buildHistoryFilter(knowledgeRecordId, query);
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
      data: data as unknown as TrendHistory[],
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

  async findLatestSnapshot(
    knowledgeRecordId: string,
  ): Promise<TrendHistory | null> {
    if (!Types.ObjectId.isValid(knowledgeRecordId)) {
      return null;
    }

    return this.model
      .findOne({ knowledgeRecordId: new Types.ObjectId(knowledgeRecordId) })
      .sort({ snapshotDate: -1 })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as TrendHistory | null;
  }

  async findById(id: string): Promise<TrendHistory | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as TrendHistory | null;
  }

  async getTrendTimeline(
    knowledgeRecordId: string,
    query: TrendHistoryQueryDto,
  ): Promise<TrendHistory[]> {
    const filter = this.buildHistoryFilter(knowledgeRecordId, query);

    return this.model
      .find(filter)
      .sort({ snapshotDate: 1 })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as TrendHistory[];
  }

  async getHistoricalStatistics(
    knowledgeRecordId: string,
  ): Promise<HistoricalStatisticsResult> {
    const snapshots = await this.getTrendTimeline(knowledgeRecordId, {
      sortOrder: 'asc',
      limit: 200,
    });

    return {
      knowledgeRecordId,
      snapshotCount: snapshots.length,
      firstSnapshotDate: snapshots[0]?.snapshotDate ?? null,
      lastSnapshotDate: snapshots.at(-1)?.snapshotDate ?? null,
      metrics: [],
    };
  }

  async deleteHistory(id: string, deletedBy?: Types.ObjectId): Promise<boolean> {
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

  async countSnapshots(knowledgeRecordId: string): Promise<number> {
    if (!Types.ObjectId.isValid(knowledgeRecordId)) {
      return 0;
    }

    return this.model
      .countDocuments({ knowledgeRecordId: new Types.ObjectId(knowledgeRecordId) })
      .exec();
  }

  private buildHistoryFilter(
    knowledgeRecordId: string,
    query: TrendHistoryQueryDto,
  ): FilterQuery<TrendHistory> {
    const filter: FilterQuery<TrendHistory> = {
      knowledgeRecordId: Types.ObjectId.isValid(knowledgeRecordId)
        ? new Types.ObjectId(knowledgeRecordId)
        : null,
    };

    if (query.from || query.to) {
      filter.snapshotDate = {};

      if (query.from) {
        filter.snapshotDate.$gte = new Date(query.from);
      }

      if (query.to) {
        filter.snapshotDate.$lte = new Date(query.to);
      }
    }

    return filter;
  }
}
import { Types } from 'mongoose';

import { TrendHistoryQueryDto } from '../dto';
import { TrendHistory } from '../entities/trend-history.entity';
import {
  HistoricalStatisticsResult,
  TrendSnapshotData,
} from '../models/trend-history.model';

export interface TrendHistoryAuditContext {
  createdBy?: Types.ObjectId;
}

export interface PaginatedTrendHistoryResult {
  data: TrendHistory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TrendHistoryRepositoryInterface {
  createSnapshot(
    snapshot: TrendSnapshotData,
    audit?: TrendHistoryAuditContext,
  ): Promise<TrendHistory>;
  createBulkSnapshots(
    snapshots: TrendSnapshotData[],
    audit?: TrendHistoryAuditContext,
  ): Promise<TrendHistory[]>;
  findHistory(
    knowledgeRecordId: string,
    query: TrendHistoryQueryDto,
  ): Promise<PaginatedTrendHistoryResult>;
  findLatestSnapshot(knowledgeRecordId: string): Promise<TrendHistory | null>;
  findById(id: string): Promise<TrendHistory | null>;
  getTrendTimeline(
    knowledgeRecordId: string,
    query: TrendHistoryQueryDto,
  ): Promise<TrendHistory[]>;
  getHistoricalStatistics(
    knowledgeRecordId: string,
  ): Promise<HistoricalStatisticsResult>;
  deleteHistory(id: string, deletedBy?: Types.ObjectId): Promise<boolean>;
  countSnapshots(knowledgeRecordId: string): Promise<number>;
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { AppLoggerService } from '../../../core/logger/logger.service';
import { AIClassificationService } from '../ai-classification/ai-classification.service';
import { KnowledgeDatabaseService } from '../knowledge-database/knowledge-database.service';
import { OpportunityScoringService } from '../opportunity-scoring/opportunity-scoring.service';
import {
  HistoricalStatisticsResponseDto,
  PaginatedTrendHistoryResponseDto,
  TrendComparisonResponseDto,
  TrendHistoryQueryDto,
  TrendHistoryResponseDto,
} from './dto';
import { TrendHistoryEngine } from './trend-history.engine';
import { TrendHistoryMapper } from './trend-history.mapper';
import { TrendHistoryRepository } from './trend-history.repository';
import { TrendHistoryValidator } from './trend-history.validator';
import { TrendSnapshotFactory } from './trend-snapshot.factory';

@Injectable()
export class TrendHistoryService {
  constructor(
    private readonly knowledgeDatabaseService: KnowledgeDatabaseService,
    private readonly classificationService: AIClassificationService,
    private readonly opportunityScoringService: OpportunityScoringService,
    private readonly snapshotFactory: TrendSnapshotFactory,
    private readonly validator: TrendHistoryValidator,
    private readonly repository: TrendHistoryRepository,
    private readonly mapper: TrendHistoryMapper,
    private readonly engine: TrendHistoryEngine,
    private readonly logger: AppLoggerService,
  ) {}

  async createSnapshot(
    knowledgeRecordId: string,
    userId?: string,
  ): Promise<TrendHistoryResponseDto> {
    const knowledge = await this.knowledgeDatabaseService.findById(
      knowledgeRecordId,
    );
    const classification = await this.getClassification(knowledgeRecordId);
    const opportunityScore = await this.getOpportunityScore(knowledgeRecordId);
    const snapshot = this.snapshotFactory.create(
      knowledge,
      classification,
      opportunityScore,
    );
    const validation = this.validator.validateSnapshot(snapshot);

    if (!validation.valid) {
      throw new NotFoundException(validation.errors.join(', '));
    }

    const record = await this.repository.createSnapshot(snapshot, {
      ...(this.toObjectId(userId) ? { createdBy: this.toObjectId(userId) } : {}),
    });

    this.logger.log({
      message: 'Trend history snapshot created',
      knowledgeRecordId,
      snapshotId: (record._id as Types.ObjectId).toString(),
      snapshotVersion: record.snapshotVersion,
    });

    return this.mapper.toResponse(record);
  }

  async findHistory(
    knowledgeRecordId: string,
    query: TrendHistoryQueryDto,
  ): Promise<PaginatedTrendHistoryResponseDto> {
    const result = await this.repository.findHistory(knowledgeRecordId, query);

    return {
      data: result.data.map((record) => this.mapper.toResponse(record)),
      meta: result.meta,
    };
  }

  async findLatestSnapshot(
    knowledgeRecordId: string,
  ): Promise<TrendHistoryResponseDto> {
    const record = await this.repository.findLatestSnapshot(knowledgeRecordId);

    if (!record) {
      throw new NotFoundException(
        `No trend history snapshot found for knowledge record "${knowledgeRecordId}"`,
      );
    }

    return this.mapper.toResponse(record);
  }

  async compareSnapshots(
    previousSnapshotId: string,
    currentSnapshotId: string,
  ): Promise<TrendComparisonResponseDto> {
    const [previous, current] = await Promise.all([
      this.repository.findById(previousSnapshotId),
      this.repository.findById(currentSnapshotId),
    ]);

    if (!previous) {
      throw new NotFoundException(
        `Trend history snapshot "${previousSnapshotId}" not found`,
      );
    }

    if (!current) {
      throw new NotFoundException(
        `Trend history snapshot "${currentSnapshotId}" not found`,
      );
    }

    if (
      (previous.knowledgeRecordId as Types.ObjectId).toString() !==
      (current.knowledgeRecordId as Types.ObjectId).toString()
    ) {
      throw new NotFoundException('Snapshots belong to different knowledge records');
    }

    return this.engine.compare(previous, current);
  }

  async getTrendTimeline(
    knowledgeRecordId: string,
    query: TrendHistoryQueryDto,
  ): Promise<TrendHistoryResponseDto[]> {
    const records = await this.repository.getTrendTimeline(knowledgeRecordId, query);

    return records.map((record) => this.mapper.toResponse(record));
  }

  async getHistoricalStatistics(
    knowledgeRecordId: string,
  ): Promise<HistoricalStatisticsResponseDto> {
    const snapshots = await this.repository.getTrendTimeline(knowledgeRecordId, {
      sortOrder: 'asc',
      limit: 200,
    });

    return this.engine.calculateStatistics(snapshots);
  }

  async deleteHistory(id: string, userId?: string): Promise<void> {
    const deleted = await this.repository.deleteHistory(id, this.toObjectId(userId));

    if (!deleted) {
      throw new NotFoundException(`Trend history snapshot "${id}" not found`);
    }
  }

  async countSnapshots(knowledgeRecordId: string): Promise<number> {
    return this.repository.countSnapshots(knowledgeRecordId);
  }

  private async getClassification(knowledgeRecordId: string) {
    try {
      return await this.classificationService.findByKnowledgeId(knowledgeRecordId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }

  private async getOpportunityScore(knowledgeRecordId: string) {
    try {
      return await this.opportunityScoringService.findByKnowledgeId(
        knowledgeRecordId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }

  private toObjectId(userId?: string): Types.ObjectId | undefined {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return undefined;
    }

    return new Types.ObjectId(userId);
  }
}
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import type { TrendHistoryResponseDto } from './dto';
import { TrendHistory } from './entities/trend-history.entity';

@Injectable()
export class TrendHistoryMapper {
  toResponse(record: TrendHistory): TrendHistoryResponseDto {
    return {
      id: (record._id as Types.ObjectId).toString(),
      knowledgeRecordId: (record.knowledgeRecordId as Types.ObjectId).toString(),
      provider: record.provider,
      externalId: record.externalId,
      snapshotDate: record.snapshotDate,
      snapshotVersion: record.snapshotVersion,
      trendScore: record.trendScore,
      opportunityScore: record.opportunityScore,
      demandScore: record.demandScore,
      competitionScore: record.competitionScore,
      searchVolume: record.searchVolume,
      rating: record.rating,
      reviewCount: record.reviewCount,
      price: record.price,
      classification: record.classification as TrendHistoryResponseDto['classification'],
      metadata: record.metadata,
      createdAt: record.createdAt,
    };
  }
}
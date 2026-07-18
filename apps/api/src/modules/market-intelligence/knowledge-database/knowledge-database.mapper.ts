import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import type { UnifiedMarketIntelligenceModel } from '../data-normalizer/models/unified-market-intelligence.model';
import { MarketKnowledgeResponseDto } from './dto';
import { MarketKnowledge } from './entities/market-knowledge.entity';
import { MarketKnowledgePersistenceData } from './interfaces/knowledge-database.repository.interface';

@Injectable()
export class KnowledgeDatabaseMapper {
  toPersistence(
    model: UnifiedMarketIntelligenceModel,
  ): MarketKnowledgePersistenceData {
    return {
      provider: model.provider,
      externalId: model.externalId,
      title: model.title,
      subtitle: model.subtitle,
      author: model.author,
      category: model.category,
      subCategory: model.subCategory,
      description: model.description,
      keywords: model.keywords,
      language: model.language,
      price: model.price,
      currency: model.currency,
      rating: model.rating,
      reviewCount: model.reviewCount,
      trendScore: model.trendScore,
      trendDirection: model.trendDirection,
      searchVolume: model.searchVolume,
      publishDate: model.publishDate ? new Date(model.publishDate) : null,
      publisher: model.publisher,
      format: model.format,
      sourceUrl: model.sourceUrl,
      coverImage: model.coverImage,
      metadata: model.metadata,
      collectedAt: new Date(model.collectedAt),
      lastNormalizedAt: new Date(),
    };
  }

  toResponse(record: MarketKnowledge): MarketKnowledgeResponseDto {
    return {
      id: (record._id as Types.ObjectId).toString(),
      provider: record.provider,
      externalId: record.externalId,
      title: record.title,
      subtitle: record.subtitle,
      author: record.author,
      category: record.category,
      subCategory: record.subCategory,
      description: record.description,
      keywords: record.keywords,
      language: record.language,
      price: record.price,
      currency: record.currency,
      rating: record.rating,
      reviewCount: record.reviewCount,
      trendScore: record.trendScore,
      trendDirection: record.trendDirection,
      searchVolume: record.searchVolume,
      publishDate: record.publishDate,
      publisher: record.publisher,
      format: record.format,
      sourceUrl: record.sourceUrl,
      coverImage: record.coverImage,
      metadata: record.metadata,
      collectedAt: record.collectedAt,
      lastNormalizedAt: record.lastNormalizedAt,
      dataVersion: record.dataVersion,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
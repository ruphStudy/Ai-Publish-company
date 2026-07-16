import { Types } from 'mongoose';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { MarketKnowledgeQueryDto } from '../dto';
import { MarketKnowledge } from '../entities/market-knowledge.entity';

export interface MarketKnowledgePersistenceData {
  provider: DataSourceProvider;
  externalId: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  category: string | null;
  subCategory: string | null;
  description: string | null;
  keywords: string[];
  language: string | null;
  price: number | null;
  currency: string | null;
  rating: number | null;
  reviewCount: number | null;
  trendScore: number | null;
  trendDirection: MarketKnowledge['trendDirection'];
  searchVolume: number | null;
  publishDate: Date | null;
  publisher: string | null;
  format: string | null;
  sourceUrl: string | null;
  coverImage: string | null;
  metadata: Record<string, unknown>;
  collectedAt: Date;
  lastNormalizedAt: Date;
}

export interface KnowledgeDatabaseAuditContext {
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface PaginatedKnowledgeResult {
  data: MarketKnowledge[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface KnowledgeDatabaseRepositoryInterface {
  create(
    data: MarketKnowledgePersistenceData,
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge>;
  createMany(
    data: MarketKnowledgePersistenceData[],
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge[]>;
  upsert(
    data: MarketKnowledgePersistenceData,
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge>;
  upsertMany(
    data: MarketKnowledgePersistenceData[],
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge[]>;
  update(
    id: string,
    data: Partial<MarketKnowledgePersistenceData>,
    audit?: KnowledgeDatabaseAuditContext,
  ): Promise<MarketKnowledge | null>;
  delete(id: string, deletedBy?: Types.ObjectId): Promise<boolean>;
  softDelete(id: string, deletedBy?: Types.ObjectId): Promise<boolean>;
  restore(id: string, restoredBy?: Types.ObjectId): Promise<MarketKnowledge | null>;
  findById(id: string): Promise<MarketKnowledge | null>;
  findByExternalId(
    provider: DataSourceProvider,
    externalId: string,
    includeDeleted?: boolean,
  ): Promise<MarketKnowledge | null>;
  search(query: MarketKnowledgeQueryDto): Promise<PaginatedKnowledgeResult>;
  filter(query: MarketKnowledgeQueryDto): Promise<PaginatedKnowledgeResult>;
  paginate(query: MarketKnowledgeQueryDto): Promise<PaginatedKnowledgeResult>;
  exists(provider: DataSourceProvider, externalId: string): Promise<boolean>;
  count(query?: MarketKnowledgeQueryDto): Promise<number>;
}
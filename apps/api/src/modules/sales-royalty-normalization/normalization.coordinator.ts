import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { RoyaltyRecord } from '../royalty-ingestion/entities/royalty-ingestion.entity';
import { SalesRecord } from '../sales-ingestion/entities/sales-ingestion.entity';
import { salesRoyaltyNormalizationDefaultPolicy } from './config/sales-royalty-normalization.config';
import { NormalizeRequestDto } from './dto';
import { NormalizationMode, NormalizationScope, NormalizationStatus } from './entities/sales-royalty-normalization.entity';
import { NormalizationEventPublisher } from './normalization-event.publisher';
import { NormalizationBatchRepository } from './normalization.repository';
import { SalesRoyaltyNormalizationEngine } from './sales-royalty-normalization.engine';
import { NormalizationValidator } from './normalization-validator';
import { NormalizationEventType } from './entities/sales-royalty-normalization.entity';

@Injectable()
export class NormalizationCoordinator {
  constructor(@InjectModel(SalesRecord.name) private readonly salesSource: Model<SalesRecord>, @InjectModel(RoyaltyRecord.name) private readonly royaltySource: Model<RoyaltyRecord>, private readonly batches: NormalizationBatchRepository, private readonly engine: SalesRoyaltyNormalizationEngine, private readonly validator: NormalizationValidator, private readonly events: NormalizationEventPublisher) {}
  async normalize(dto: NormalizeRequestDto, userId?: string) {
    this.validator.validateRequest(dto); const idempotencyKey = dto.idempotencyKey ?? this.idempotencyKey(dto); const existing = await this.batches.findByIdempotencyKey(idempotencyKey); if (existing) return existing;
    const profile = salesRoyaltyNormalizationDefaultPolicy.mappingProfiles[0]; const batch = await this.batches.create({ normalizationBatchId: `NRB-${randomUUID()}`, scope: dto.scope, mode: dto.mode, projectId: dto.projectId ?? null, providerKey: dto.providerKey ?? null, importIds: dto.importIds ?? [], mappingProfileId: salesRoyaltyNormalizationDefaultPolicy.defaultMappingProfileId, mappingProfileVersion: profile.profileVersion, status: NormalizationStatus.NORMALIZING, idempotencyKey, sourceRecordCount: 0, maximumRetries: salesRoyaltyNormalizationDefaultPolicy.maximumRetries, startedAt: new Date(), reprocessingReason: dto.reprocessingReason ?? null, correlationId: dto.correlationId ?? null, createdBy: userId ?? null, updatedBy: userId ?? null });
    this.events.publish(dto.mode === NormalizationMode.REPROCESS ? NormalizationEventType.REPROCESSING_STARTED : NormalizationEventType.NORMALIZATION_STARTED, { batchId: batch.normalizationBatchId });
    const salesRecords = dto.scope !== NormalizationScope.ROYALTY ? await this.loadSales(dto) : []; const royaltyRecords = dto.scope !== NormalizationScope.SALES ? await this.loadRoyalties(dto) : []; let normalizedCount = 0; let duplicateCount = 0; let failedCount = 0;
    for (const record of salesRecords) { try { const result = await this.engine.normalizeSalesRecord(batch.normalizationBatchId, record.toObject() as Record<string, unknown>, userId); result.status === 'DUPLICATE' ? duplicateCount += 1 : normalizedCount += 1; } catch { failedCount += 1; } }
    for (const record of royaltyRecords) { try { const result = await this.engine.normalizeRoyaltyRecord(batch.normalizationBatchId, record.toObject() as Record<string, unknown>, userId); result.status === 'DUPLICATE' ? duplicateCount += 1 : normalizedCount += 1; } catch { failedCount += 1; } }
    const sourceRecordCount = salesRecords.length + royaltyRecords.length; const status = failedCount ? normalizedCount ? NormalizationStatus.PARTIALLY_NORMALIZED : NormalizationStatus.FAILED : NormalizationStatus.NORMALIZED;
    const updated = await this.batches.update(String(batch._id), { status, sourceRecordCount, normalizedCount, duplicateCount, failedCount, completedAt: new Date(), updatedBy: userId ?? null });
    this.events.publish(status === NormalizationStatus.FAILED ? NormalizationEventType.NORMALIZATION_FAILED : NormalizationEventType.NORMALIZATION_COMPLETED, { batchId: batch.normalizationBatchId, normalizedCount, duplicateCount, failedCount });
    return updated;
  }
  private loadSales(dto: NormalizeRequestDto) { return this.salesSource.find(this.sourceFilter(dto)).limit(salesRoyaltyNormalizationDefaultPolicy.batchSize).exec(); }
  private loadRoyalties(dto: NormalizeRequestDto) { return this.royaltySource.find(this.sourceFilter(dto)).limit(salesRoyaltyNormalizationDefaultPolicy.batchSize).exec(); }
  private sourceFilter(dto: NormalizeRequestDto): FilterQuery<SalesRecord | RoyaltyRecord> { const filter: FilterQuery<SalesRecord | RoyaltyRecord> = {}; if (dto.projectId) filter.projectId = dto.projectId; if (dto.providerKey) filter.providerKey = dto.providerKey; if (dto.importIds?.length) filter.importId = { $in: dto.importIds }; if (dto.sourceRecordId) filter._id = dto.sourceRecordId; return filter; }
  private idempotencyKey(dto: NormalizeRequestDto): string { return createHash('sha256').update(JSON.stringify({ scope: dto.scope, mode: dto.mode, projectId: dto.projectId, providerKey: dto.providerKey, importIds: dto.importIds, sourceRecordId: dto.sourceRecordId, from: dto.from, to: dto.to, profile: salesRoyaltyNormalizationDefaultPolicy.defaultMappingProfileVersion })).digest('hex'); }
}

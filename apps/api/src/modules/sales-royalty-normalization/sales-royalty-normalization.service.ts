import { Injectable, NotFoundException } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { CanonicalSearchDto, NormalizationQueryDto, NormalizeRequestDto, ResolveMappingDto } from './dto';
import { CanonicalRoyalty } from './entities/canonical-royalty.entity';
import { CanonicalSales } from './entities/canonical-sales.entity';
import { NormalizationBatch, NormalizationRecordStatus } from './entities/sales-royalty-normalization.entity';
import { CanonicalRoyaltyRepository } from './canonical-royalty.repository';
import { CanonicalSalesRepository } from './canonical-sales.repository';
import { NormalizationCoordinator } from './normalization.coordinator';
import { NormalizationBatchRepository, NormalizationResultRepository } from './normalization.repository';

@Injectable()
export class SalesRoyaltyNormalizationService {
  constructor(private readonly coordinator: NormalizationCoordinator, private readonly batches: NormalizationBatchRepository, private readonly results: NormalizationResultRepository, private readonly sales: CanonicalSalesRepository, private readonly royalties: CanonicalRoyaltyRepository) {}
  normalize(dto: NormalizeRequestDto, userId?: string) { return this.coordinator.normalize(dto, userId); }
  queueBatch(dto: NormalizeRequestDto, userId?: string) { return this.normalize(dto, userId); }
  getBatch(id: string) { return this.batches.findById(id); }
  latest(projectId: string) { return this.batches.findLatestByProject(projectId); }
  async progress(id: string) { const batch = await this.batches.findById(id); if (!batch) throw new NotFoundException('Normalization batch not found'); return { normalizationBatchId: batch.normalizationBatchId, status: batch.status, sourceRecordCount: batch.sourceRecordCount, normalizedCount: batch.normalizedCount, duplicateCount: batch.duplicateCount, mappingRequiredCount: batch.mappingRequiredCount, conflictCount: batch.conflictCount, failedCount: batch.failedCount }; }
  listBatches(query: NormalizationQueryDto) { const filter: FilterQuery<NormalizationBatch> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.providerKey) filter.providerKey = query.providerKey; if (query.importId) filter.importIds = query.importId; if (query.status) filter.status = query.status; if (query.mappingProfileId) filter.mappingProfileId = query.mappingProfileId; if (query.mappingProfileVersion) filter.mappingProfileVersion = query.mappingProfileVersion; return this.batches.paginate(filter, query.page, query.limit); }
  listResults(batchId: string, query: NormalizationQueryDto) { void query; return this.results.findByBatchId(batchId); }
  mappingRequired() { return this.results.findMappingRequired(); }
  conflicted() { return this.results.findConflicted(); }
  retryFailed() { return this.results.findFailed(); }
  resume(id: string) { return this.batches.update(id, { status: 'NORMALIZING' }); }
  cancel(id: string) { return this.batches.update(id, { status: 'CANCELLED', cancelledAt: new Date() }); }
  reprocess(dto: NormalizeRequestDto, userId?: string) { return this.normalize({ ...dto, mode: 'REPROCESS' as never }, userId); }
  preview(dto: NormalizeRequestDto) { return { scope: dto.scope, mode: dto.mode, mappingProfileId: 'GLOBAL_DEFAULT', mappingProfileVersion: '1' }; }
  resolveBookMapping(dto: ResolveMappingDto) { return { status: NormalizationRecordStatus.PENDING, mapping: dto }; }
  resolveEditionMapping(dto: ResolveMappingDto) { return { status: NormalizationRecordStatus.PENDING, mapping: dto }; }
  resolveConflict(dto: ResolveMappingDto) { return { resolved: true, mapping: dto }; }
  getCanonicalSales(id: string) { return this.sales.findById(id); }
  getCanonicalRoyalty(id: string) { return this.royalties.findById(id); }
  searchSales(query: CanonicalSearchDto) { const filter: FilterQuery<CanonicalSales> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.bookId) filter.bookId = query.bookId; if (query.editionId) filter.editionId = query.editionId; if (query.providerKey) filter.providerKey = query.providerKey; if (query.from || query.to) filter.saleDateUtc = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) }; return this.sales.paginate(filter, query.page, query.limit); }
  searchRoyalties(query: CanonicalSearchDto) { const filter: FilterQuery<CanonicalRoyalty> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.bookId) filter.bookId = query.bookId; if (query.editionId) filter.editionId = query.editionId; if (query.providerKey) filter.providerKey = query.providerKey; if (query.from || query.to) filter.royaltyPeriodStart = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) }; return this.royalties.paginate(filter, query.page, query.limit); }
  async softDelete(id: string, userId?: string) { if (!(await this.batches.softDelete(id, userId))) throw new NotFoundException('Normalization batch not found'); }
  restore(id: string) { return this.batches.restore(id); }
}

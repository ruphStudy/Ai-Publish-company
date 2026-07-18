import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { royaltyIngestionDefaultPolicy } from './config/royalty-ingestion.config';
import { ImportRoyaltiesDto } from './dto';
import { RoyaltyDuplicatePolicy, RoyaltyImportStatus, RoyaltyImportTrigger, RoyaltyIngestionEventType, RoyaltyProviderCapability } from './entities/royalty-ingestion.entity';
import { RoyaltyImportRepository } from './royalty-import.repository';
import { RoyaltyImportNormalizer } from './royalty-import.normalizer';
import { RoyaltyImportValidator } from './royalty-import.validator';
import { RoyaltyIngestionEventPublisher } from './royalty-ingestion-event.publisher';
import { RoyaltyProviderResolver } from './royalty-provider.resolver';

@Injectable()
export class RoyaltyIngestionEngine {
  constructor(private readonly repository: RoyaltyImportRepository, private readonly resolver: RoyaltyProviderResolver, private readonly validator: RoyaltyImportValidator, private readonly normalizer: RoyaltyImportNormalizer, private readonly events: RoyaltyIngestionEventPublisher) {}
  async import(dto: ImportRoyaltiesDto, userId?: string) {
    this.validator.validateImport(dto); this.resolver.resolve(dto.providerKey, this.capability(dto.source));
    const importFingerprint = dto.idempotencyKey ?? this.normalizer.importFingerprint({ providerKey: dto.providerKey, projectId: dto.projectId, source: dto.source, fileHash: dto.fileHash, records: dto.records });
    const existing = await this.repository.findByImportFingerprint(importFingerprint); if (existing) return existing;
    const importId = `RIJ-${randomUUID()}`;
    const job = await this.repository.createJob({ importId, providerKey: dto.providerKey, projectId: dto.projectId ?? null, source: dto.source, trigger: dto.trigger ?? RoyaltyImportTrigger.MANUAL, fileName: dto.fileName ?? null, fileHash: dto.fileHash ?? null, importFingerprint, startedAt: new Date(), status: RoyaltyImportStatus.IMPORTING, maximumRetries: royaltyIngestionDefaultPolicy.maximumRetries, createdBy: userId ?? null, updatedBy: userId ?? null });
    this.events.publish(RoyaltyIngestionEventType.IMPORT_STARTED, { importId, providerKey: dto.providerKey });
    let importedRecords = 0; let duplicateRecords = 0; let failedRecords = 0; const errors: Record<string, unknown>[] = [];
    for (const raw of dto.records) {
      try {
        const normalized = this.normalizer.normalize(raw, dto.providerKey, dto.source, dto.projectId);
        if (await this.repository.findRecordByFingerprint(normalized.importFingerprint)) { duplicateRecords += 1; this.events.publish(RoyaltyIngestionEventType.DUPLICATE_DETECTED, { importId, fingerprint: normalized.importFingerprint }); if (royaltyIngestionDefaultPolicy.duplicatePolicy === RoyaltyDuplicatePolicy.FAIL_IMPORT) throw new Error('Duplicate royalty record detected'); continue; }
        await this.repository.create({ royaltyRecordId: `RIR-${randomUUID()}`, projectId: normalized.projectId, providerKey: dto.providerKey, marketplace: normalized.marketplace, country: normalized.country, currency: normalized.currency, timezone: normalized.timezone, royaltyPeriod: normalized.royaltyPeriod, paymentDate: normalized.paymentDate ? new Date(normalized.paymentDate) : null, reportingDate: new Date(normalized.reportingDate), paymentStatus: normalized.paymentStatus, royaltyType: normalized.royaltyType, estimated: normalized.estimated, finalized: normalized.finalized, bookId: normalized.bookId, editionId: normalized.editionId, format: normalized.format, unitsSold: normalized.unitsSold, grossRevenue: normalized.grossRevenue, royaltyRate: normalized.royaltyRate, royaltyAmount: normalized.royaltyAmount, taxAmount: normalized.taxAmount, withholdingTax: normalized.withholdingTax, paymentAmount: normalized.paymentAmount, transactionId: normalized.transactionId, externalReference: normalized.externalReference, originalValues: normalized.originalValues, normalizedValues: normalized.normalizedValues, metadata: normalized.metadata, source: dto.source, importId, importFingerprint: normalized.importFingerprint, createdBy: userId ?? null, updatedBy: userId ?? null });
        importedRecords += 1; this.events.publish(RoyaltyIngestionEventType.ROYALTY_IMPORTED, { importId }); if (normalized.finalized || normalized.paymentStatus === 'PAID') this.events.publish(RoyaltyIngestionEventType.PAYMENT_RECONCILED, { importId });
      } catch (error) { failedRecords += 1; errors.push({ message: error instanceof Error ? error.message : 'Royalty record import failed' }); }
    }
    const status = failedRecords ? importedRecords ? RoyaltyImportStatus.PARTIALLY_COMPLETED : RoyaltyImportStatus.FAILED : RoyaltyImportStatus.COMPLETED;
    const updated = await this.repository.update(String(job._id), { status, importedRecords, duplicateRecords, failedRecords, skippedRecords: duplicateRecords, errors, completedAt: new Date(), updatedBy: userId ?? null });
    this.events.publish(status === RoyaltyImportStatus.FAILED ? RoyaltyIngestionEventType.IMPORT_FAILED : RoyaltyIngestionEventType.IMPORT_COMPLETED, { importId, importedRecords, duplicateRecords, failedRecords });
    return updated;
  }
  capability(source: string): RoyaltyProviderCapability { if (source === 'PROVIDER_API') return RoyaltyProviderCapability.API_IMPORT; if (source === 'CSV') return RoyaltyProviderCapability.CSV_IMPORT; if (source === 'EXCEL') return RoyaltyProviderCapability.XLSX_IMPORT; return RoyaltyProviderCapability.MANUAL_IMPORT; }
}

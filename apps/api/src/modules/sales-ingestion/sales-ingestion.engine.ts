import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { salesIngestionDefaultPolicy } from './config/sales-ingestion.config';
import { ImportSalesDto } from './dto';
import { SalesDuplicatePolicy, SalesImportStatus, SalesImportTrigger, SalesIngestionEventType, SalesProviderCapability } from './entities/sales-ingestion.entity';
import { SalesImportRepository } from './sales-import.repository';
import { SalesImportNormalizer } from './sales-import.normalizer';
import { SalesImportValidator } from './sales-import.validator';
import { SalesIngestionEventPublisher } from './sales-ingestion-event.publisher';
import { SalesProviderResolver } from './sales-provider.resolver';

@Injectable()
export class SalesIngestionEngine {
  constructor(private readonly repository: SalesImportRepository, private readonly resolver: SalesProviderResolver, private readonly validator: SalesImportValidator, private readonly normalizer: SalesImportNormalizer, private readonly events: SalesIngestionEventPublisher) {}
  async import(dto: ImportSalesDto, userId?: string) {
    this.validator.validateImport(dto);
    this.resolver.resolve(dto.providerKey, this.capability(dto.source));
    const importFingerprint = dto.idempotencyKey ?? this.normalizer.importFingerprint({ providerKey: dto.providerKey, projectId: dto.projectId, source: dto.source, fileHash: dto.fileHash, records: dto.records });
    const existing = await this.repository.findByImportFingerprint(importFingerprint);
    if (existing) return existing;
    const importId = `SIJ-${randomUUID()}`;
    const job = await this.repository.createJob({ importId, providerKey: dto.providerKey, projectId: dto.projectId ?? null, source: dto.source, trigger: dto.trigger ?? SalesImportTrigger.MANUAL, fileName: dto.fileName ?? null, fileHash: dto.fileHash ?? null, importFingerprint, startedAt: new Date(), status: SalesImportStatus.IMPORTING, maximumRetries: salesIngestionDefaultPolicy.maximumRetries, createdBy: userId ?? null, updatedBy: userId ?? null });
    this.events.publish(SalesIngestionEventType.IMPORT_STARTED, { importId, providerKey: dto.providerKey });
    let importedRecords = 0; let duplicateRecords = 0; let failedRecords = 0; const errors: Record<string, unknown>[] = [];
    for (const raw of dto.records) {
      try {
        const normalized = this.normalizer.normalize(raw, dto.providerKey, dto.source, dto.projectId);
        if (await this.repository.findRecordByFingerprint(normalized.importFingerprint)) { duplicateRecords += 1; this.events.publish(SalesIngestionEventType.DUPLICATE_DETECTED, { importId, fingerprint: normalized.importFingerprint }); if (salesIngestionDefaultPolicy.duplicatePolicy === SalesDuplicatePolicy.FAIL_IMPORT) throw new Error('Duplicate sales record detected'); continue; }
        await this.repository.create({ salesRecordId: `SIR-${randomUUID()}`, projectId: normalized.projectId, providerKey: dto.providerKey, marketplace: normalized.marketplace, country: normalized.country, currency: normalized.currency, timezone: normalized.timezone, saleDate: new Date(normalized.saleDate), reportingDate: new Date(normalized.reportingDate), bookId: normalized.bookId, editionId: normalized.editionId, format: normalized.format, quantity: normalized.quantity, grossAmount: normalized.grossAmount, netAmount: normalized.netAmount, taxAmount: normalized.taxAmount, discountAmount: normalized.discountAmount, transactionId: normalized.transactionId, externalReference: normalized.externalReference, originalValues: normalized.originalValues, normalizedValues: normalized.normalizedValues, metadata: normalized.metadata, source: dto.source, importId, importFingerprint: normalized.importFingerprint, createdBy: userId ?? null, updatedBy: userId ?? null });
        importedRecords += 1; this.events.publish(SalesIngestionEventType.RECORD_IMPORTED, { importId });
      } catch (error) { failedRecords += 1; errors.push({ message: error instanceof Error ? error.message : 'Sales record import failed' }); }
    }
    const status = failedRecords ? importedRecords ? SalesImportStatus.PARTIALLY_COMPLETED : SalesImportStatus.FAILED : SalesImportStatus.COMPLETED;
    const updated = await this.repository.update(String(job._id), { status, importedRecords, duplicateRecords, failedRecords, skippedRecords: duplicateRecords, errors, completedAt: new Date(), updatedBy: userId ?? null });
    this.events.publish(status === SalesImportStatus.FAILED ? SalesIngestionEventType.IMPORT_FAILED : SalesIngestionEventType.IMPORT_COMPLETED, { importId, importedRecords, duplicateRecords, failedRecords });
    return updated;
  }
  capability(source: string): SalesProviderCapability { if (source === 'PROVIDER_API') return SalesProviderCapability.API_IMPORT; if (source === 'CSV') return SalesProviderCapability.CSV_IMPORT; if (source === 'EXCEL') return SalesProviderCapability.XLSX_IMPORT; return SalesProviderCapability.MANUAL_IMPORT; }
}

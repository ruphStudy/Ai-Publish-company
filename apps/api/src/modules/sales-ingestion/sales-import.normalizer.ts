import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { salesIngestionDefaultPolicy } from './config/sales-ingestion.config';
import { SalesImportSource } from './entities/sales-ingestion.entity';
import type { NormalizedSalesRecord, RawSalesRecord } from './interfaces/sales-ingestion.interface';

@Injectable()
export class SalesImportNormalizer {
  normalize(record: RawSalesRecord, providerKey: string, source: SalesImportSource, defaultProjectId?: string): NormalizedSalesRecord {
    const country = this.country(record.country ?? 'US');
    const currency = this.currency(record.currency ?? 'USD');
    const marketplace = this.marketplace(record.marketplace ?? providerKey);
    const normalized: NormalizedSalesRecord = { projectId: record.projectId ?? defaultProjectId ?? 'unmatched', marketplace, country, currency, timezone: record.timezone ?? salesIngestionDefaultPolicy.timezoneMapping[country] ?? salesIngestionDefaultPolicy.timezoneMapping.DEFAULT, saleDate: record.saleDate, reportingDate: record.reportingDate ?? record.saleDate, bookId: record.bookId ?? null, editionId: record.editionId ?? null, format: (record.format ?? 'UNKNOWN').toUpperCase(), quantity: Number(record.quantity), grossAmount: Number(record.grossAmount), netAmount: Number(record.netAmount ?? record.grossAmount), taxAmount: Number(record.taxAmount ?? 0), discountAmount: Number(record.discountAmount ?? 0), transactionId: record.transactionId ?? null, externalReference: record.externalReference ?? null, metadata: this.sanitize(record.metadata ?? {}), originalValues: this.sanitize(record as unknown as Record<string, unknown>), normalizedValues: { providerKey, marketplace, country, currency }, source, importFingerprint: '' };
    normalized.importFingerprint = this.fingerprint(providerKey, normalized);
    return normalized;
  }
  country(value: string): string { return salesIngestionDefaultPolicy.countryMapping[value.toUpperCase()] ?? value.toUpperCase(); }
  currency(value: string): string { return salesIngestionDefaultPolicy.currencyMapping[value.toUpperCase()] ?? value.toUpperCase(); }
  marketplace(value: string): string { return salesIngestionDefaultPolicy.marketplaceMapping[value.toUpperCase()] ?? value.toUpperCase(); }
  fingerprint(providerKey: string, record: Omit<NormalizedSalesRecord, 'importFingerprint'>): string { return createHash('sha256').update(JSON.stringify({ providerKey, transactionId: record.transactionId, saleDate: record.saleDate, bookId: record.bookId, editionId: record.editionId, quantity: record.quantity, netAmount: record.netAmount, externalReference: record.externalReference })).digest('hex'); }
  importFingerprint(input: Record<string, unknown>): string { return createHash('sha256').update(JSON.stringify(input)).digest('hex'); }
  sanitize(input: Record<string, unknown>): Record<string, unknown> { const sensitive = /token|secret|password|cookie|authorization|credential/i; return Object.fromEntries(Object.entries(input).filter(([key]) => !sensitive.test(key))); }
}

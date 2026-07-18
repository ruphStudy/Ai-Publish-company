import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { royaltyIngestionDefaultPolicy } from './config/royalty-ingestion.config';
import { RoyaltyImportSource, RoyaltyPaymentStatus, RoyaltyType } from './entities/royalty-ingestion.entity';
import type { NormalizedRoyaltyRecord, RawRoyaltyRecord } from './interfaces/royalty-ingestion.interface';

@Injectable()
export class RoyaltyImportNormalizer {
  normalize(record: RawRoyaltyRecord, providerKey: string, source: RoyaltyImportSource, defaultProjectId?: string): NormalizedRoyaltyRecord {
    const country = this.country(record.country ?? 'US'); const currency = this.currency(record.currency ?? 'USD'); const marketplace = this.marketplace(record.marketplace ?? providerKey); const paymentStatus = this.paymentStatus(record.paymentStatus ?? (record.finalized ? 'FINALIZED' : record.estimated ? 'ESTIMATED' : 'PENDING')); const royaltyType = this.royaltyType(record.royaltyType ?? (record.finalized ? 'FINAL' : record.estimated ? 'ESTIMATED' : 'PAYMENT'));
    const normalized: NormalizedRoyaltyRecord = { projectId: record.projectId ?? defaultProjectId ?? 'unmatched', marketplace, country, currency, timezone: record.timezone ?? royaltyIngestionDefaultPolicy.timezoneMapping[country] ?? royaltyIngestionDefaultPolicy.timezoneMapping.DEFAULT, royaltyPeriod: record.royaltyPeriod, paymentDate: record.paymentDate ?? null, reportingDate: record.reportingDate ?? record.paymentDate ?? new Date(), paymentStatus, royaltyType, estimated: record.estimated ?? royaltyType === RoyaltyType.ESTIMATED, finalized: record.finalized ?? [RoyaltyType.FINAL, RoyaltyType.PAYMENT].includes(royaltyType), bookId: record.bookId ?? null, editionId: record.editionId ?? null, format: (record.format ?? 'UNKNOWN').toUpperCase(), unitsSold: Number(record.unitsSold ?? 0), grossRevenue: Number(record.grossRevenue ?? 0), royaltyRate: Number(record.royaltyRate ?? 0), royaltyAmount: Number(record.royaltyAmount), taxAmount: Number(record.taxAmount ?? 0), withholdingTax: Number(record.withholdingTax ?? 0), paymentAmount: Number(record.paymentAmount ?? record.royaltyAmount), transactionId: record.transactionId ?? null, externalReference: record.externalReference ?? null, metadata: this.sanitize(record.metadata ?? {}), originalValues: this.sanitize(record as unknown as Record<string, unknown>), normalizedValues: { providerKey, marketplace, country, currency, paymentStatus, royaltyType }, source, importFingerprint: '' };
    normalized.importFingerprint = this.fingerprint(providerKey, normalized);
    return normalized;
  }
  country(value: string): string { return royaltyIngestionDefaultPolicy.countryMapping[value.toUpperCase()] ?? value.toUpperCase(); }
  currency(value: string): string { return royaltyIngestionDefaultPolicy.currencyMapping[value.toUpperCase()] ?? value.toUpperCase(); }
  marketplace(value: string): string { return royaltyIngestionDefaultPolicy.marketplaceMapping[value.toUpperCase()] ?? value.toUpperCase(); }
  paymentStatus(value: string): RoyaltyPaymentStatus { return royaltyIngestionDefaultPolicy.paymentStatusMapping[value.toUpperCase()] ?? RoyaltyPaymentStatus.UNKNOWN; }
  royaltyType(value: string): RoyaltyType { const key = value.toUpperCase(); if (key === 'FINAL') return RoyaltyType.FINAL; if (key === 'ADJUSTMENT') return RoyaltyType.ADJUSTMENT; if (key === 'CORRECTION') return RoyaltyType.CORRECTION; if (key === 'ESTIMATED') return RoyaltyType.ESTIMATED; return RoyaltyType.PAYMENT; }
  fingerprint(providerKey: string, record: Omit<NormalizedRoyaltyRecord, 'importFingerprint'>): string { return createHash('sha256').update(JSON.stringify({ providerKey, transactionId: record.transactionId, royaltyPeriod: record.royaltyPeriod, paymentDate: record.paymentDate, bookId: record.bookId, editionId: record.editionId, royaltyAmount: record.royaltyAmount, paymentAmount: record.paymentAmount, externalReference: record.externalReference })).digest('hex'); }
  importFingerprint(input: Record<string, unknown>): string { return createHash('sha256').update(JSON.stringify(input)).digest('hex'); }
  sanitize(input: Record<string, unknown>): Record<string, unknown> { const sensitive = /token|secret|password|cookie|authorization|credential/i; return Object.fromEntries(Object.entries(input).filter(([key]) => !sensitive.test(key))); }
}

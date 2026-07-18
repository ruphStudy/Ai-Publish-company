import { Injectable } from '@nestjs/common';
import { googlePlayBooksDefaultConfiguration } from './config/google-play-books.config';
import type { GooglePlayBooksMetadata } from './interfaces/google-play-books.interface';

@Injectable()
export class GooglePlayBooksMetadataMapper {
  map(metadata: Record<string, unknown>): GooglePlayBooksMetadata {
    const config = googlePlayBooksDefaultConfiguration;
    const keywords = Array.isArray(metadata.keywords) ? metadata.keywords.map(String).slice(0, config.maxKeywords) : [];
    const subjectCategories = Array.isArray(metadata.bisacCategories) ? metadata.bisacCategories.map(String).slice(0, config.maxSubjects) : [];
    return { title: String(metadata.title ?? ''), subtitle: metadata.subtitle ? String(metadata.subtitle) : undefined, edition: metadata.edition ? String(metadata.edition) : undefined, publisher: String(metadata.publisherName ?? config.publisherProfile), imprint: config.imprint ?? undefined, primaryAuthor: String(metadata.authorName ?? ''), contributors: [], description: String(metadata.longDescription ?? metadata.shortDescription ?? ''), language: String(metadata.language ?? config.language), subjectCategories, keywords, isbn: metadata.isbn ? String(metadata.isbn) : undefined, identifierStrategy: config.identifierStrategy, territories: config.defaultSalesTerritories, salesTerritories: config.defaultSalesTerritories, previewTerritories: config.previewTerritories, pricing: { territory: config.defaultSalesTerritories[0], currency: config.pricingProfile.currency, amount: config.pricingProfile.amount, taxIncluded: config.pricingProfile.taxIncluded, pricingProfile: 'DEFAULT', effectiveDate: new Date().toISOString().slice(0, 10), sourcePricingVersion: config.pricingProfile.sourcePricingVersion }, rightsInformation: { rightsProfile: config.rightsProfile }, drmPreference: config.drmPolicy, copyPastePreference: config.copyPastePolicy, previewPercentage: config.previewPercentage, ageRange: metadata.ageGroup ? String(metadata.ageGroup) : undefined, audienceInformation: metadata.readingLevel ? String(metadata.readingLevel) : undefined, aiContentDisclosure: { decisionRequired: true, source: 'APC_COMPLIANCE_MODEL' } };
  }
}

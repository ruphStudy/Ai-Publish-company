import { Injectable } from '@nestjs/common';
import { draft2DigitalDefaultConfiguration } from './config/draft2digital.config';
import type { Draft2DigitalMetadata } from './interfaces/draft2digital.interface';

@Injectable()
export class Draft2DigitalMetadataMapper {
  map(metadata: Record<string, unknown>): Draft2DigitalMetadata {
    const config = draft2DigitalDefaultConfiguration;
    const keywords = Array.isArray(metadata.keywords) ? metadata.keywords.map(String).slice(0, config.maxKeywords) : [];
    const categories = Array.isArray(metadata.bisacCategories) ? metadata.bisacCategories.map(String).slice(0, config.maxCategories) : [];
    return { title: String(metadata.title ?? ''), subtitle: metadata.subtitle ? String(metadata.subtitle) : undefined, author: String(metadata.authorName ?? ''), contributors: [], description: String(metadata.longDescription ?? metadata.shortDescription ?? ''), language: String(metadata.language ?? config.language), keywords, categories, isbn: metadata.isbn ? String(metadata.isbn) : undefined, pricing: { currency: config.pricingProfile.currency, listPrice: config.pricingProfile.listPrice, royaltyProfile: config.pricingProfile.royaltyProfile, territoryProfile: config.territoryProfile, pricingVersion: 'draft2digital-pricing-v1' }, territories: [config.territoryProfile], aiDisclosure: { decisionRequired: true, source: 'APC_COMPLIANCE_MODEL' } };
  }
}

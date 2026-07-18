import { Injectable } from '@nestjs/common';
import { amazonKdpDefaultConfiguration } from './config/amazon-kdp.config';
import type { AmazonKdpMetadata } from './interfaces/amazon-kdp.interface';

@Injectable()
export class AmazonKdpMetadataMapper {
  map(metadata: Record<string, unknown>): AmazonKdpMetadata {
    const config = amazonKdpDefaultConfiguration;
    const keywords = Array.isArray(metadata.keywords) ? metadata.keywords.map(String).slice(0, config.maxKeywords) : [];
    const categories = Array.isArray(metadata.amazonCategories) ? metadata.amazonCategories.map(String).slice(0, config.maxCategories) : Array.isArray(metadata.bisacCategories) ? metadata.bisacCategories.map(String).slice(0, config.maxCategories) : [];
    return { title: String(metadata.title ?? ''), subtitle: String(metadata.subtitle ?? ''), edition: String(metadata.edition ?? ''), primaryAuthor: String(metadata.authorName ?? ''), contributors: [], description: String(metadata.amazonDescription ?? metadata.longDescription ?? ''), publishingRights: config.rightsOwnershipProfile, keywords, categories, primaryMarketplace: config.primaryMarketplace, language: String(metadata.language ?? config.bookLanguage), readingAge: metadata.ageGroup ? String(metadata.ageGroup) : undefined, isbn: metadata.isbn ? String(metadata.isbn) : undefined, imprint: config.imprint ?? undefined, drmPreference: config.drmPreference, kdpSelectPreference: config.kdpSelectPreference, territories: config.defaultTerritories, pricing: { currency: config.pricingProfile.currency, listPrice: config.pricingProfile.listPrice, marketplace: config.primaryMarketplace, territory: config.defaultTerritories[0], royaltyPreference: config.pricingProfile.royaltyPreference, minimumPrice: config.pricingProfile.minimumPrice, maximumPrice: config.pricingProfile.maximumPrice, taxIncluded: config.pricingProfile.taxIncluded, sourcePricingProfile: 'DEFAULT', pricingVersion: 'kdp-pricing-v1' }, aiContentDisclosure: { decisionRequired: true, source: 'APC_COMPLIANCE_MODEL' } };
  }
}

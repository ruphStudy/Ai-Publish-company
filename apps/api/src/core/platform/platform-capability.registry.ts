import { Injectable } from '@nestjs/common';
import { PublishingCapability, PublishingTargetType } from '../../modules/publishing-workflow/entities/publishing-workflow.entity';

export enum PlatformCapability {
  PUBLISHING = 'PUBLISHING',
  METADATA_UPDATE = 'METADATA_UPDATE',
  PRICING = 'PRICING',
  RIGHTS = 'RIGHTS',
  SALES_REPORTING = 'SALES_REPORTING',
  REVENUE_REPORTING = 'REVENUE_REPORTING',
  ROYALTY_REPORTING = 'ROYALTY_REPORTING',
  ANALYTICS = 'ANALYTICS',
  IMPORT = 'IMPORT',
  SYNCHRONIZATION = 'SYNCHRONIZATION',
  AI_SUPPORT = 'AI_SUPPORT',
  BULK_OPERATIONS = 'BULK_OPERATIONS',
}

export enum PlatformAuthenticationStrategy {
  NONE = 'NONE',
  MANUAL = 'MANUAL',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  SERVICE_ACCOUNT = 'SERVICE_ACCOUNT',
}

export interface PlatformProviderMetadata {
  identifier: string;
  displayName: string;
  capabilities: PlatformCapability[];
  publishingCapabilities: PublishingCapability[];
  supportedEntities: string[];
  authenticationStrategy: PlatformAuthenticationStrategy;
  apiVersion: string;
  featureFlags: string[];
  limits: Record<string, number>;
  regions: string[];
  status: 'ACTIVE' | 'MANUAL_ASSISTED' | 'PLANNED' | 'DISABLED';
  targetType: PublishingTargetType;
  marketplaces: string[];
}

export interface PlatformMarketplaceMetadata {
  identifier: string;
  displayName: string;
  providerKeys: string[];
  regions: string[];
  languages: string[];
  currencies: string[];
  capabilities: PlatformCapability[];
  status: 'ACTIVE' | 'PLANNED' | 'DISABLED';
}

export const platformProviderRegistryDefaults: PlatformProviderMetadata[] = [
  {
    identifier: 'mock',
    displayName: 'Mock Publishing Provider',
    capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.SYNCHRONIZATION],
    publishingCapabilities: [PublishingCapability.EBOOK, PublishingCapability.PRINT, PublishingCapability.STATUS_POLLING, PublishingCapability.CANCELLATION],
    supportedEntities: ['BOOK', 'EDITION', 'EXPORT_ARTIFACT'],
    authenticationStrategy: PlatformAuthenticationStrategy.NONE,
    apiVersion: 'local-v1',
    featureFlags: ['mockPublishing'],
    limits: { maximumArtifacts: 20, maximumRetries: 2 },
    regions: ['WORLDWIDE'],
    status: 'ACTIVE',
    targetType: PublishingTargetType.DIRECT_EXPORT,
    marketplaces: ['LOCAL_EXPORT'],
  },
  {
    identifier: 'AMAZON_KDP',
    displayName: 'Amazon KDP',
    capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.METADATA_UPDATE, PlatformCapability.PRICING, PlatformCapability.RIGHTS, PlatformCapability.SYNCHRONIZATION],
    publishingCapabilities: [PublishingCapability.EBOOK, PublishingCapability.PAPERBACK, PublishingCapability.HARDCOVER, PublishingCapability.PREORDER, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.DRM, PublishingCapability.ISBN, PublishingCapability.AUTHOR_PROFILE, PublishingCapability.CONTRIBUTORS, PublishingCapability.SERIES, PublishingCapability.CATEGORIES, PublishingCapability.KEYWORDS, PublishingCapability.STATUS_MANUAL_UPDATE, PublishingCapability.METADATA_UPDATE, PublishingCapability.FILE_REPLACEMENT, PublishingCapability.PRINT_OPTIONS],
    supportedEntities: ['BOOK', 'EDITION', 'AUTHOR', 'SERIES', 'CATEGORY', 'KEYWORD', 'PRICE', 'RIGHTS'],
    authenticationStrategy: PlatformAuthenticationStrategy.MANUAL,
    apiVersion: 'manual-assisted-v1',
    featureFlags: ['amazonKdpManualSubmission'],
    limits: { maximumKeywords: 7, maximumCategories: 3, maximumContributors: 10 },
    regions: ['US', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'JP', 'BR', 'CA', 'MX', 'AU', 'IN'],
    status: 'MANUAL_ASSISTED',
    targetType: PublishingTargetType.PLATFORM,
    marketplaces: ['AMAZON_US', 'AMAZON_UK', 'AMAZON_DE', 'AMAZON_CA', 'AMAZON_AU'],
  },
  {
    identifier: 'DRAFT2DIGITAL',
    displayName: 'Draft2Digital',
    capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.METADATA_UPDATE, PlatformCapability.PRICING, PlatformCapability.RIGHTS, PlatformCapability.SYNCHRONIZATION],
    publishingCapabilities: [PublishingCapability.EBOOK, PublishingCapability.PRINT, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.ISBN, PublishingCapability.AUTHOR_PROFILE, PublishingCapability.CONTRIBUTORS, PublishingCapability.CATEGORIES, PublishingCapability.KEYWORDS, PublishingCapability.STATUS_MANUAL_UPDATE, PublishingCapability.METADATA_UPDATE, PublishingCapability.FILE_REPLACEMENT],
    supportedEntities: ['BOOK', 'EDITION', 'AUTHOR', 'SERIES', 'PRICE', 'RIGHTS'],
    authenticationStrategy: PlatformAuthenticationStrategy.MANUAL,
    apiVersion: 'manual-assisted-v1',
    featureFlags: ['draft2DigitalManualSubmission'],
    limits: { maximumKeywords: 10, maximumContributors: 10 },
    regions: ['WORLDWIDE'],
    status: 'MANUAL_ASSISTED',
    targetType: PublishingTargetType.DISTRIBUTOR,
    marketplaces: ['APPLE_BOOKS', 'KOBO', 'BARNES_AND_NOBLE', 'EVERAND', 'TOLINO', 'BIBLIO'],
  },
  {
    identifier: 'GOOGLE_PLAY_BOOKS',
    displayName: 'Google Play Books',
    capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.METADATA_UPDATE, PlatformCapability.PRICING, PlatformCapability.RIGHTS, PlatformCapability.SYNCHRONIZATION],
    publishingCapabilities: [PublishingCapability.EBOOK, PublishingCapability.EPUB, PublishingCapability.PDF_EBOOK, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.MULTI_CURRENCY, PublishingCapability.DRM, PublishingCapability.ISBN, PublishingCapability.PROVIDER_GENERATED_IDENTIFIER, PublishingCapability.AUTHOR_PROFILE, PublishingCapability.CONTRIBUTORS, PublishingCapability.SERIES, PublishingCapability.CATEGORIES, PublishingCapability.SUBJECTS, PublishingCapability.PREVIEW_CONFIGURATION, PublishingCapability.STATUS_MANUAL_UPDATE, PublishingCapability.METADATA_UPDATE, PublishingCapability.FILE_REPLACEMENT, PublishingCapability.PUBLICATION_DATE],
    supportedEntities: ['BOOK', 'EDITION', 'AUTHOR', 'SERIES', 'PRICE', 'RIGHTS'],
    authenticationStrategy: PlatformAuthenticationStrategy.MANUAL,
    apiVersion: 'manual-assisted-v1',
    featureFlags: ['googlePlayBooksManualSubmission'],
    limits: { maximumSubjects: 3, maximumContributors: 10 },
    regions: ['WORLDWIDE'],
    status: 'MANUAL_ASSISTED',
    targetType: PublishingTargetType.PLATFORM,
    marketplaces: ['GOOGLE_PLAY_BOOKS'],
  },
  {
    identifier: 'INGRAMSPARK',
    displayName: 'IngramSpark',
    capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.METADATA_UPDATE, PlatformCapability.PRICING, PlatformCapability.RIGHTS, PlatformCapability.SALES_REPORTING, PlatformCapability.ROYALTY_REPORTING],
    publishingCapabilities: [PublishingCapability.EBOOK, PublishingCapability.PAPERBACK, PublishingCapability.HARDCOVER, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.ISBN, PublishingCapability.METADATA_UPDATE, PublishingCapability.PRINT_OPTIONS],
    supportedEntities: ['BOOK', 'EDITION', 'PRICE', 'RIGHTS'],
    authenticationStrategy: PlatformAuthenticationStrategy.API_KEY,
    apiVersion: 'planned',
    featureFlags: ['ingramSparkProvider'],
    limits: {},
    regions: ['WORLDWIDE'],
    status: 'PLANNED',
    targetType: PublishingTargetType.DISTRIBUTOR,
    marketplaces: ['INGRAM_GLOBAL'],
  },
  {
    identifier: 'LULU',
    displayName: 'Lulu',
    capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.METADATA_UPDATE, PlatformCapability.PRICING, PlatformCapability.RIGHTS],
    publishingCapabilities: [PublishingCapability.PAPERBACK, PublishingCapability.HARDCOVER, PublishingCapability.PRICING, PublishingCapability.ISBN, PublishingCapability.PRINT_OPTIONS],
    supportedEntities: ['BOOK', 'EDITION', 'PRICE'],
    authenticationStrategy: PlatformAuthenticationStrategy.OAUTH2,
    apiVersion: 'planned',
    featureFlags: ['luluProvider'],
    limits: {},
    regions: ['WORLDWIDE'],
    status: 'PLANNED',
    targetType: PublishingTargetType.PLATFORM,
    marketplaces: ['LULU'],
  },
];

export const platformMarketplaceRegistryDefaults: PlatformMarketplaceMetadata[] = [
  { identifier: 'LOCAL_EXPORT', displayName: 'Local Export', providerKeys: ['mock'], regions: ['LOCAL'], languages: ['en'], currencies: ['USD'], capabilities: [PlatformCapability.PUBLISHING], status: 'ACTIVE' },
  { identifier: 'AMAZON_US', displayName: 'Amazon.com', providerKeys: ['AMAZON_KDP'], regions: ['US'], languages: ['en'], currencies: ['USD'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING], status: 'ACTIVE' },
  { identifier: 'AMAZON_UK', displayName: 'Amazon.co.uk', providerKeys: ['AMAZON_KDP'], regions: ['GB'], languages: ['en'], currencies: ['GBP'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING], status: 'ACTIVE' },
  { identifier: 'GOOGLE_PLAY_BOOKS', displayName: 'Google Play Books', providerKeys: ['GOOGLE_PLAY_BOOKS'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR', 'INR'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING], status: 'ACTIVE' },
  { identifier: 'APPLE_BOOKS', displayName: 'Apple Books', providerKeys: ['DRAFT2DIGITAL'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING], status: 'PLANNED' },
  { identifier: 'KOBO', displayName: 'Kobo', providerKeys: ['DRAFT2DIGITAL'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'CAD', 'GBP', 'EUR'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING], status: 'PLANNED' },
  { identifier: 'BARNES_AND_NOBLE', displayName: 'Barnes & Noble', providerKeys: ['DRAFT2DIGITAL'], regions: ['US'], languages: ['en'], currencies: ['USD'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING], status: 'PLANNED' },
  { identifier: 'INGRAM_GLOBAL', displayName: 'Ingram Global Distribution', providerKeys: ['INGRAMSPARK'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING, PlatformCapability.ROYALTY_REPORTING], status: 'PLANNED' },
  { identifier: 'LULU', displayName: 'Lulu Marketplace', providerKeys: ['LULU'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR'], capabilities: [PlatformCapability.PUBLISHING, PlatformCapability.PRICING], status: 'PLANNED' },
];

@Injectable()
export class PlatformCapabilityRegistry {
  providers() { return platformProviderRegistryDefaults; }
  marketplaces() { return platformMarketplaceRegistryDefaults; }
  provider(identifier: string) { return this.providers().find((provider) => provider.identifier === identifier); }
  marketplace(identifier: string) { return this.marketplaces().find((marketplace) => marketplace.identifier === identifier); }
  providerSupports(identifier: string, capability: PlatformCapability) { return this.provider(identifier)?.capabilities.includes(capability) ?? false; }
  providerPublishingCapabilities(identifier: string) { return this.provider(identifier)?.publishingCapabilities ?? []; }
  activeProviders() { return this.providers().filter((provider) => provider.status === 'ACTIVE' || provider.status === 'MANUAL_ASSISTED'); }
}

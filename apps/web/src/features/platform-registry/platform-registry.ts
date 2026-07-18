export type PlatformCapability =
  | 'PUBLISHING'
  | 'METADATA_UPDATE'
  | 'PRICING'
  | 'RIGHTS'
  | 'SALES_REPORTING'
  | 'REVENUE_REPORTING'
  | 'ROYALTY_REPORTING'
  | 'ANALYTICS'
  | 'IMPORT'
  | 'SYNCHRONIZATION'
  | 'AI_SUPPORT'
  | 'BULK_OPERATIONS';

export interface PlatformProviderDefinition {
  identifier: string;
  displayName: string;
  capabilities: PlatformCapability[];
  regions: string[];
  marketplaces: string[];
  status: 'ACTIVE' | 'MANUAL_ASSISTED' | 'PLANNED' | 'DISABLED';
  featureFlag?: string;
}

export interface PlatformMarketplaceDefinition {
  identifier: string;
  displayName: string;
  providerKeys: string[];
  regions: string[];
  languages: string[];
  currencies: string[];
  capabilities: PlatformCapability[];
  status: 'ACTIVE' | 'PLANNED' | 'DISABLED';
}

export const platformProviders: PlatformProviderDefinition[] = [
  { identifier: 'AMAZON_KDP', displayName: 'Amazon KDP', capabilities: ['PUBLISHING', 'METADATA_UPDATE', 'PRICING', 'RIGHTS', 'SYNCHRONIZATION'], regions: ['US', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'JP', 'BR', 'CA', 'MX', 'AU', 'IN'], marketplaces: ['AMAZON_US', 'AMAZON_UK', 'AMAZON_DE', 'AMAZON_CA', 'AMAZON_AU'], status: 'MANUAL_ASSISTED', featureFlag: 'amazonKdpManualSubmission' },
  { identifier: 'DRAFT2DIGITAL', displayName: 'Draft2Digital', capabilities: ['PUBLISHING', 'METADATA_UPDATE', 'PRICING', 'RIGHTS', 'SYNCHRONIZATION'], regions: ['WORLDWIDE'], marketplaces: ['APPLE_BOOKS', 'KOBO', 'BARNES_AND_NOBLE', 'EVERAND', 'TOLINO', 'BIBLIO'], status: 'MANUAL_ASSISTED', featureFlag: 'draft2DigitalManualSubmission' },
  { identifier: 'GOOGLE_PLAY_BOOKS', displayName: 'Google Play Books', capabilities: ['PUBLISHING', 'METADATA_UPDATE', 'PRICING', 'RIGHTS', 'SYNCHRONIZATION'], regions: ['WORLDWIDE'], marketplaces: ['GOOGLE_PLAY_BOOKS'], status: 'MANUAL_ASSISTED', featureFlag: 'googlePlayBooksManualSubmission' },
  { identifier: 'INGRAMSPARK', displayName: 'IngramSpark', capabilities: ['PUBLISHING', 'METADATA_UPDATE', 'PRICING', 'RIGHTS', 'SALES_REPORTING', 'ROYALTY_REPORTING'], regions: ['WORLDWIDE'], marketplaces: ['INGRAM_GLOBAL'], status: 'PLANNED', featureFlag: 'ingramSparkProvider' },
  { identifier: 'LULU', displayName: 'Lulu', capabilities: ['PUBLISHING', 'METADATA_UPDATE', 'PRICING', 'RIGHTS'], regions: ['WORLDWIDE'], marketplaces: ['LULU'], status: 'PLANNED', featureFlag: 'luluProvider' },
];

export const platformMarketplaces: PlatformMarketplaceDefinition[] = [
  { identifier: 'AMAZON_US', displayName: 'Amazon.com', providerKeys: ['AMAZON_KDP'], regions: ['US'], languages: ['en'], currencies: ['USD'], capabilities: ['PUBLISHING', 'PRICING'], status: 'ACTIVE' },
  { identifier: 'AMAZON_UK', displayName: 'Amazon.co.uk', providerKeys: ['AMAZON_KDP'], regions: ['GB'], languages: ['en'], currencies: ['GBP'], capabilities: ['PUBLISHING', 'PRICING'], status: 'ACTIVE' },
  { identifier: 'GOOGLE_PLAY_BOOKS', displayName: 'Google Play Books', providerKeys: ['GOOGLE_PLAY_BOOKS'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR', 'INR'], capabilities: ['PUBLISHING', 'PRICING'], status: 'ACTIVE' },
  { identifier: 'APPLE_BOOKS', displayName: 'Apple Books', providerKeys: ['DRAFT2DIGITAL'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR'], capabilities: ['PUBLISHING', 'PRICING'], status: 'PLANNED' },
  { identifier: 'KOBO', displayName: 'Kobo', providerKeys: ['DRAFT2DIGITAL'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'CAD', 'GBP', 'EUR'], capabilities: ['PUBLISHING', 'PRICING'], status: 'PLANNED' },
  { identifier: 'BARNES_AND_NOBLE', displayName: 'Barnes & Noble', providerKeys: ['DRAFT2DIGITAL'], regions: ['US'], languages: ['en'], currencies: ['USD'], capabilities: ['PUBLISHING', 'PRICING'], status: 'PLANNED' },
  { identifier: 'INGRAM_GLOBAL', displayName: 'Ingram Global Distribution', providerKeys: ['INGRAMSPARK'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR'], capabilities: ['PUBLISHING', 'PRICING', 'ROYALTY_REPORTING'], status: 'PLANNED' },
  { identifier: 'LULU', displayName: 'Lulu Marketplace', providerKeys: ['LULU'], regions: ['WORLDWIDE'], languages: ['en'], currencies: ['USD', 'GBP', 'EUR'], capabilities: ['PUBLISHING', 'PRICING'], status: 'PLANNED' },
];

export const platformDefaults = {
  reportingCurrency: 'USD',
  supportedCurrencies: [...new Set(platformMarketplaces.flatMap((marketplace) => marketplace.currencies))].sort(),
  supportedRegions: [...new Set(platformMarketplaces.flatMap((marketplace) => marketplace.regions))].sort(),
  supportedLanguages: [...new Set(platformMarketplaces.flatMap((marketplace) => marketplace.languages))].sort(),
};

export function getPlatformProvider(identifier?: string | null) {
  return platformProviders.find((provider) => provider.identifier === identifier);
}

export function getPlatformMarketplace(identifier?: string | null) {
  return platformMarketplaces.find((marketplace) => marketplace.identifier === identifier);
}

export function platformProviderSupports(identifier: string | undefined, capability: PlatformCapability) {
  return getPlatformProvider(identifier)?.capabilities.includes(capability) ?? false;
}

export function marketplaceSupports(identifier: string | undefined, capability: PlatformCapability) {
  return getPlatformMarketplace(identifier)?.capabilities.includes(capability) ?? false;
}

export const platformRegistryQueryKeys = {
  all: ['platform-registry'] as const,
};

export async function fetchPlatformRegistry() {
  const { data } = await api.get<{ providers: PlatformProviderDefinition[]; marketplaces: PlatformMarketplaceDefinition[]; activeProviders: PlatformProviderDefinition[] }>('/platform-registry');
  return data;
}
import { api } from '@/lib/api-client';

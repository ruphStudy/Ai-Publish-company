import { PublishingCapability } from '../../publishing-workflow/entities/publishing-workflow.entity';
import { Draft2DigitalFormat, Draft2DigitalIntegrationMode } from '../entities/draft2digital.entity';

export interface Draft2DigitalConfiguration {
  providerKey: 'DRAFT2DIGITAL';
  integrationMode: Draft2DigitalIntegrationMode;
  enabledFormats: Draft2DigitalFormat[];
  distributionProfile: string;
  language: string;
  pricingProfile: { currency: string; listPrice: number; royaltyProfile: string };
  territoryProfile: string;
  publicationProfile: string;
  maxKeywords: number;
  maxCategories: number;
  manualChecklistVersion: string;
  requiredAssets: string[];
  requiredApprovals: string[];
  requiredArtifactTypes: Record<Draft2DigitalFormat, string[]>;
  providerCapabilities: PublishingCapability[];
}
export const draft2DigitalDefaultConfiguration: Draft2DigitalConfiguration = {
  providerKey: 'DRAFT2DIGITAL',
  integrationMode: Draft2DigitalIntegrationMode.MANUAL_ASSISTED,
  enabledFormats: [Draft2DigitalFormat.EPUB, Draft2DigitalFormat.PRINT],
  distributionProfile: 'DEFAULT_DISTRIBUTION',
  language: 'en',
  pricingProfile: { currency: 'USD', listPrice: 9.99, royaltyProfile: 'STANDARD' },
  territoryProfile: 'WORLDWIDE',
  publicationProfile: 'MANUAL_ASSISTED',
  maxKeywords: 7,
  maxCategories: 3,
  manualChecklistVersion: 'draft2digital-manual-checklist-v1',
  requiredAssets: ['MANUSCRIPT'],
  requiredApprovals: ['PUBLICATION_READINESS'],
  requiredArtifactTypes: { EPUB: ['EPUB'], PRINT: ['PDF'] },
  providerCapabilities: [PublishingCapability.EBOOK, PublishingCapability.PRINT, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.ISBN, PublishingCapability.AUTHOR_PROFILE, PublishingCapability.CONTRIBUTORS, PublishingCapability.CATEGORIES, PublishingCapability.KEYWORDS, PublishingCapability.STATUS_MANUAL_UPDATE, PublishingCapability.METADATA_UPDATE, PublishingCapability.FILE_REPLACEMENT],
};

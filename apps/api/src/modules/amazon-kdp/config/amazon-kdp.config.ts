import { PublishingCapability } from '../../publishing-workflow/entities/publishing-workflow.entity';
import { AmazonKdpFormat, AmazonKdpIntegrationMode } from '../entities/amazon-kdp.entity';

export interface AmazonKdpConfiguration {
  providerKey: 'AMAZON_KDP';
  integrationMode: AmazonKdpIntegrationMode;
  enabledFormats: AmazonKdpFormat[];
  primaryMarketplace: string;
  bookLanguage: string;
  defaultTerritories: string[];
  rightsOwnershipProfile: string;
  pricingProfile: { currency: string; listPrice: number; minimumPrice: number; maximumPrice: number; royaltyPreference: string; taxIncluded: boolean };
  drmPreference: boolean;
  kdpSelectPreference: boolean;
  preorderPreference: boolean;
  trimSizeProfile: string;
  bleedProfile: string;
  paperAndInkProfile: string;
  coverFinishProfile: string;
  isbnStrategy: string;
  imprint: string | null;
  maxKeywords: number;
  maxCategories: number;
  manualSubmissionChecklistVersion: string;
  requiredArtifactTypes: Record<AmazonKdpFormat, string[]>;
  requiredChecksumPolicy: 'SHA256_REQUIRED';
  providerCapabilityOverrides: PublishingCapability[];
}
export const amazonKdpDefaultConfiguration: AmazonKdpConfiguration = {
  providerKey: 'AMAZON_KDP',
  integrationMode: AmazonKdpIntegrationMode.MANUAL_ASSISTED,
  enabledFormats: [AmazonKdpFormat.KINDLE_EBOOK, AmazonKdpFormat.PAPERBACK],
  primaryMarketplace: 'US',
  bookLanguage: 'en',
  defaultTerritories: ['WORLDWIDE'],
  rightsOwnershipProfile: 'AUTHOR_OWNS_RIGHTS',
  pricingProfile: { currency: 'USD', listPrice: 9.99, minimumPrice: 0.99, maximumPrice: 250, royaltyPreference: 'STANDARD', taxIncluded: false },
  drmPreference: false,
  kdpSelectPreference: false,
  preorderPreference: false,
  trimSizeProfile: '6x9',
  bleedProfile: 'NO_BLEED',
  paperAndInkProfile: 'BLACK_WHITE_WHITE_PAPER',
  coverFinishProfile: 'MATTE',
  isbnStrategy: 'KDP_FREE_ISBN_OR_PROVIDED',
  imprint: null,
  maxKeywords: 7,
  maxCategories: 3,
  manualSubmissionChecklistVersion: 'kdp-manual-checklist-v1',
  requiredArtifactTypes: { KINDLE_EBOOK: ['EPUB'], PAPERBACK: ['PRINT_PDF'], HARDCOVER: ['PRINT_PDF'] },
  requiredChecksumPolicy: 'SHA256_REQUIRED',
  providerCapabilityOverrides: [PublishingCapability.EBOOK, PublishingCapability.PAPERBACK, PublishingCapability.HARDCOVER, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.DRM, PublishingCapability.ISBN, PublishingCapability.AUTHOR_PROFILE, PublishingCapability.METADATA_UPDATE, PublishingCapability.FILE_REPLACEMENT],
};

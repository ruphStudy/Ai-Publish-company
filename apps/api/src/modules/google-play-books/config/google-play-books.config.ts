import { PublishingCapability } from '../../publishing-workflow/entities/publishing-workflow.entity';
import { GooglePlayBooksFormat, GooglePlayBooksIdentifierStrategy, GooglePlayBooksIntegrationMode } from '../entities/google-play-books.entity';

export interface GooglePlayBooksConfiguration {
  providerKey: 'GOOGLE_PLAY_BOOKS';
  integrationMode: GooglePlayBooksIntegrationMode;
  enabledFormats: GooglePlayBooksFormat[];
  identifierStrategy: GooglePlayBooksIdentifierStrategy;
  accountProfileReference: string | null;
  publisherProfile: string;
  imprint: string | null;
  language: string;
  defaultSalesTerritories: string[];
  previewTerritories: string[];
  rightsProfile: string;
  pricingProfile: { currency: string; amount: number; taxIncluded: boolean; sourcePricingVersion: string };
  currencyConversionPreference: string;
  publicationDatePolicy: string;
  preorderPolicy: string;
  drmPolicy: boolean;
  copyPastePolicy: boolean;
  previewPercentage: number;
  maxKeywords: number;
  maxSubjects: number;
  maxFileSizeBytes: number;
  manualChecklistVersion: string;
  requiredContentArtifacts: Record<GooglePlayBooksFormat, string[]>;
  requiredCoverArtifacts: string[];
  providerCapabilities: PublishingCapability[];
}
export const googlePlayBooksDefaultConfiguration: GooglePlayBooksConfiguration = {
  providerKey: 'GOOGLE_PLAY_BOOKS',
  integrationMode: GooglePlayBooksIntegrationMode.MANUAL_ASSISTED,
  enabledFormats: [GooglePlayBooksFormat.EPUB, GooglePlayBooksFormat.PDF_EBOOK],
  identifierStrategy: GooglePlayBooksIdentifierStrategy.GOOGLE_GENERATED_IDENTIFIER,
  accountProfileReference: null,
  publisherProfile: 'DEFAULT_PUBLISHER',
  imprint: null,
  language: 'en',
  defaultSalesTerritories: ['WORLDWIDE'],
  previewTerritories: ['WORLDWIDE'],
  rightsProfile: 'WORLDWIDE_RIGHTS',
  pricingProfile: { currency: 'USD', amount: 9.99, taxIncluded: false, sourcePricingVersion: 'google-play-books-pricing-v1' },
  currencyConversionPreference: 'MANUAL_REVIEW',
  publicationDatePolicy: 'MANUAL',
  preorderPolicy: 'DISABLED',
  drmPolicy: false,
  copyPastePolicy: false,
  previewPercentage: 20,
  maxKeywords: 7,
  maxSubjects: 5,
  maxFileSizeBytes: 2_000_000_000,
  manualChecklistVersion: 'google-play-books-manual-checklist-v1',
  requiredContentArtifacts: { EPUB: ['EPUB'], PDF_EBOOK: ['PDF'] },
  requiredCoverArtifacts: [],
  providerCapabilities: [PublishingCapability.EBOOK, PublishingCapability.EPUB, PublishingCapability.PDF_EBOOK, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.MULTI_CURRENCY, PublishingCapability.DRM, PublishingCapability.ISBN, PublishingCapability.PROVIDER_GENERATED_IDENTIFIER, PublishingCapability.AUTHOR_PROFILE, PublishingCapability.CONTRIBUTORS, PublishingCapability.SERIES, PublishingCapability.CATEGORIES, PublishingCapability.SUBJECTS, PublishingCapability.PREVIEW_CONFIGURATION, PublishingCapability.STATUS_MANUAL_UPDATE, PublishingCapability.METADATA_UPDATE, PublishingCapability.FILE_REPLACEMENT, PublishingCapability.PUBLICATION_DATE],
};

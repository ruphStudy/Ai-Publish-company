import type { GooglePlayBooksChecklistItem, GooglePlayBooksFormat, GooglePlayBooksIdentifierStrategy } from '../entities/google-play-books.entity';

export interface GooglePlayBooksMetadata {
  title: string;
  subtitle?: string;
  seriesTitle?: string;
  seriesNumber?: string;
  edition?: string;
  publisher: string;
  imprint?: string;
  primaryAuthor: string;
  contributors: { role: string; name: string }[];
  description: string;
  language: string;
  subjectCategories: string[];
  keywords: string[];
  publicationDate?: string;
  preorderDate?: string;
  isbn?: string;
  identifierStrategy: GooglePlayBooksIdentifierStrategy;
  territories: string[];
  salesTerritories: string[];
  previewTerritories: string[];
  pricing: { territory: string; currency: string; amount: number; taxIncluded: boolean; pricingProfile: string; effectiveDate: string; sourcePricingVersion: string };
  rightsInformation: Record<string, unknown>;
  drmPreference: boolean;
  copyPastePreference: boolean;
  previewPercentage: number;
  ageRange?: string;
  audienceInformation?: string;
  aiContentDisclosure: Record<string, unknown>;
}
export interface GooglePlayBooksPreparedPackage {
  contentFormat: GooglePlayBooksFormat;
  identifierStrategy: GooglePlayBooksIdentifierStrategy;
  metadataSnapshot: GooglePlayBooksMetadata;
  rightsSnapshot: Record<string, unknown>;
  territorySnapshot: Record<string, unknown>;
  pricingSnapshot: Record<string, unknown>;
  previewSnapshot: Record<string, unknown>;
  artifactReferences: Record<string, unknown>[];
  coverReferences: Record<string, unknown>[];
  validationIssues: string[];
  warnings: string[];
  checklist: GooglePlayBooksChecklistItem[];
  submissionFingerprint: string;
}

import type { AmazonKdpChecklistItem, AmazonKdpFormat } from '../entities/amazon-kdp.entity';

export interface AmazonKdpMetadata {
  title: string;
  subtitle?: string;
  seriesTitle?: string;
  seriesNumber?: string;
  edition?: string;
  primaryAuthor: string;
  contributors: { role: string; name: string }[];
  description: string;
  publishingRights: string;
  keywords: string[];
  categories: string[];
  primaryMarketplace: string;
  language: string;
  readingAge?: string;
  gradeRange?: string;
  publicationDate?: string;
  preorderDate?: string;
  isbn?: string;
  imprint?: string;
  drmPreference: boolean;
  kdpSelectPreference: boolean;
  territories: string[];
  pricing: { currency: string; listPrice: number; marketplace: string; territory: string; royaltyPreference: string; minimumPrice: number; maximumPrice: number; taxIncluded: boolean; sourcePricingProfile: string; pricingVersion: string };
  aiContentDisclosure: Record<string, unknown>;
}
export interface AmazonKdpPreparedPackage {
  kdpFormat: AmazonKdpFormat;
  metadataSnapshot: AmazonKdpMetadata;
  rightsSnapshot: Record<string, unknown>;
  pricingSnapshot: Record<string, unknown>;
  printOptionsSnapshot: Record<string, unknown>;
  artifactReferences: Record<string, unknown>[];
  coverReferences: Record<string, unknown>[];
  validationIssues: string[];
  warnings: string[];
  checklist: AmazonKdpChecklistItem[];
  submissionFingerprint: string;
}

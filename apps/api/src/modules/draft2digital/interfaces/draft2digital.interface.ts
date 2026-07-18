import type { Draft2DigitalChecklistItem, Draft2DigitalFormat } from '../entities/draft2digital.entity';

export interface Draft2DigitalMetadata {
  title: string;
  subtitle?: string;
  author: string;
  contributors: { role: string; name: string }[];
  description: string;
  language: string;
  keywords: string[];
  categories: string[];
  isbn?: string;
  publicationDate?: string;
  pricing: { currency: string; listPrice: number; royaltyProfile: string; territoryProfile: string; pricingVersion: string };
  territories: string[];
  aiDisclosure: Record<string, unknown>;
}
export interface Draft2DigitalPreparedPackage {
  d2dFormat: Draft2DigitalFormat;
  metadataSnapshot: Draft2DigitalMetadata;
  pricingSnapshot: Record<string, unknown>;
  artifactReferences: Record<string, unknown>[];
  coverReferences: Record<string, unknown>[];
  validationIssues: string[];
  warnings: string[];
  checklist: Draft2DigitalChecklistItem[];
  submissionFingerprint: string;
}

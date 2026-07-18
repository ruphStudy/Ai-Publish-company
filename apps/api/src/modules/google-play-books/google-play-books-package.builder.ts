import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { ExportJobDocument } from '../export/entities/export-job.entity';
import { GooglePlayBooksSubmissionChecklistBuilder } from './google-play-books-checklist.builder';
import { googlePlayBooksDefaultConfiguration } from './config/google-play-books.config';
import { GooglePlayBooksMetadataMapper } from './google-play-books-metadata.mapper';
import { GooglePlayBooksValidator } from './google-play-books.validator';
import { GooglePlayBooksFormat } from './entities/google-play-books.entity';
import type { GooglePlayBooksPreparedPackage } from './interfaces/google-play-books.interface';

@Injectable()
export class GooglePlayBooksPackageBuilder {
  constructor(private readonly mapper: GooglePlayBooksMetadataMapper, private readonly checklist: GooglePlayBooksSubmissionChecklistBuilder, private readonly validator: GooglePlayBooksValidator) {}
  build(input: { projectId: string; manuscriptVersion: string; contentFormat: GooglePlayBooksFormat; metadata: Record<string, unknown>; exportJob: ExportJobDocument | null; coverReferences?: Record<string, unknown>[] }): GooglePlayBooksPreparedPackage {
    const metadataSnapshot = this.mapper.map(input.metadata);
    const metadataIssues = this.validator.validateMetadata(metadataSnapshot);
    const artifacts = this.validator.validateArtifacts(input.contentFormat, input.exportJob);
    const rightsSnapshot = { rightsProfile: googlePlayBooksDefaultConfiguration.rightsProfile };
    const territorySnapshot = { salesTerritories: metadataSnapshot.salesTerritories, previewTerritories: metadataSnapshot.previewTerritories };
    const pricingSnapshot = metadataSnapshot.pricing;
    const previewSnapshot = { previewPercentage: metadataSnapshot.previewPercentage, copyPastePreference: metadataSnapshot.copyPastePreference };
    const submissionFingerprint = createHash('sha256').update(JSON.stringify({ projectId: input.projectId, manuscriptVersion: input.manuscriptVersion, contentFormat: input.contentFormat, metadataSnapshot, artifactReferences: artifacts.artifacts, pricingSnapshot, territorySnapshot, previewSnapshot })).digest('hex');
    return { contentFormat: input.contentFormat, identifierStrategy: metadataSnapshot.identifierStrategy, metadataSnapshot, rightsSnapshot, territorySnapshot, pricingSnapshot, previewSnapshot, artifactReferences: artifacts.artifacts, coverReferences: input.coverReferences ?? [], validationIssues: metadataIssues.concat(artifacts.issues), warnings: artifacts.warnings.concat('Manual-assisted Google Play Books package only. External submission has not occurred.'), checklist: this.checklist.build(metadataSnapshot), submissionFingerprint };
  }
}

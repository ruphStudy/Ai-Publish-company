import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { ExportJobDocument } from '../export/entities/export-job.entity';
import { AmazonKdpMetadataMapper } from './amazon-kdp-metadata.mapper';
import { AmazonKdpSubmissionChecklistBuilder } from './amazon-kdp-checklist.builder';
import { AmazonKdpValidator } from './amazon-kdp.validator';
import { amazonKdpDefaultConfiguration } from './config/amazon-kdp.config';
import { AmazonKdpFormat } from './entities/amazon-kdp.entity';
import type { AmazonKdpPreparedPackage } from './interfaces/amazon-kdp.interface';

@Injectable()
export class AmazonKdpPackageBuilder {
  constructor(private readonly mapper: AmazonKdpMetadataMapper, private readonly checklist: AmazonKdpSubmissionChecklistBuilder, private readonly validator: AmazonKdpValidator) {}
  build(input: { projectId: string; manuscriptVersion: string; kdpFormat: AmazonKdpFormat; metadata: Record<string, unknown>; exportJob: ExportJobDocument | null; coverReferences?: Record<string, unknown>[] }): AmazonKdpPreparedPackage {
    const metadataSnapshot = this.mapper.map(input.metadata);
    const metadataIssues = this.validator.validateMetadata(metadataSnapshot, input.kdpFormat);
    const artifacts = this.validator.validateArtifacts(input.kdpFormat, input.exportJob);
    const rightsSnapshot = { ownershipProfile: amazonKdpDefaultConfiguration.rightsOwnershipProfile, territories: amazonKdpDefaultConfiguration.defaultTerritories };
    const pricingSnapshot = metadataSnapshot.pricing;
    const printOptionsSnapshot = [AmazonKdpFormat.PAPERBACK, AmazonKdpFormat.HARDCOVER].includes(input.kdpFormat) ? { trimSizeProfile: amazonKdpDefaultConfiguration.trimSizeProfile, bleedProfile: amazonKdpDefaultConfiguration.bleedProfile, paperAndInkProfile: amazonKdpDefaultConfiguration.paperAndInkProfile, coverFinishProfile: amazonKdpDefaultConfiguration.coverFinishProfile, printerLevelAcceptance: false } : {};
    const submissionFingerprint = createHash('sha256').update(JSON.stringify({ projectId: input.projectId, manuscriptVersion: input.manuscriptVersion, kdpFormat: input.kdpFormat, metadataSnapshot, artifactReferences: artifacts.artifacts, pricingSnapshot, printOptionsSnapshot })).digest('hex');
    return { kdpFormat: input.kdpFormat, metadataSnapshot, rightsSnapshot, pricingSnapshot, printOptionsSnapshot, artifactReferences: artifacts.artifacts, coverReferences: input.coverReferences ?? [], validationIssues: metadataIssues.concat(artifacts.issues), warnings: artifacts.warnings.concat('Manual-assisted KDP package only. External Amazon submission has not occurred.'), checklist: this.checklist.build(metadataSnapshot), submissionFingerprint };
  }
}

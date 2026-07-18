import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { ExportJobDocument } from '../export/entities/export-job.entity';
import { Draft2DigitalSubmissionChecklistBuilder } from './draft2digital-checklist.builder';
import { Draft2DigitalMetadataMapper } from './draft2digital-metadata.mapper';
import { Draft2DigitalValidator } from './draft2digital.validator';
import { Draft2DigitalFormat } from './entities/draft2digital.entity';
import type { Draft2DigitalPreparedPackage } from './interfaces/draft2digital.interface';

@Injectable()
export class Draft2DigitalPackageBuilder {
  constructor(private readonly mapper: Draft2DigitalMetadataMapper, private readonly checklist: Draft2DigitalSubmissionChecklistBuilder, private readonly validator: Draft2DigitalValidator) {}
  build(input: { projectId: string; manuscriptVersion: string; d2dFormat: Draft2DigitalFormat; metadata: Record<string, unknown>; exportJob: ExportJobDocument | null; coverReferences?: Record<string, unknown>[] }): Draft2DigitalPreparedPackage {
    const metadataSnapshot = this.mapper.map(input.metadata);
    const metadataIssues = this.validator.validateMetadata(metadataSnapshot);
    const artifacts = this.validator.validateArtifacts(input.d2dFormat, input.exportJob);
    const pricingSnapshot = metadataSnapshot.pricing;
    const submissionFingerprint = createHash('sha256').update(JSON.stringify({ projectId: input.projectId, manuscriptVersion: input.manuscriptVersion, d2dFormat: input.d2dFormat, metadataSnapshot, artifactReferences: artifacts.artifacts, pricingSnapshot })).digest('hex');
    return { d2dFormat: input.d2dFormat, metadataSnapshot, pricingSnapshot, artifactReferences: artifacts.artifacts, coverReferences: input.coverReferences ?? [], validationIssues: metadataIssues.concat(artifacts.issues), warnings: artifacts.warnings.concat('Manual-assisted Draft2Digital package only. External publishing has not occurred.'), checklist: this.checklist.build(metadataSnapshot), submissionFingerprint };
  }
}

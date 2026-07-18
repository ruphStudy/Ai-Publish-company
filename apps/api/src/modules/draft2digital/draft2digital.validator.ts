import { BadRequestException, Injectable } from '@nestjs/common';
import type { ExportJobDocument } from '../export/entities/export-job.entity';
import { ExportJobStatus } from '../export/entities/export-job.entity';
import { draft2DigitalDefaultConfiguration } from './config/draft2digital.config';
import { Draft2DigitalFormat, Draft2DigitalIntegrationMode, Draft2DigitalStatus } from './entities/draft2digital.entity';
import type { Draft2DigitalMetadata } from './interfaces/draft2digital.interface';

@Injectable()
export class Draft2DigitalValidator {
  validateConfiguration(mode = draft2DigitalDefaultConfiguration.integrationMode): void { if (mode === Draft2DigitalIntegrationMode.API) throw new BadRequestException('Draft2Digital API mode is unavailable until an official API adapter is configured'); }
  validateMetadata(metadata: Draft2DigitalMetadata): string[] {
    const issues: string[] = [];
    if (!metadata.title.trim()) issues.push('Draft2Digital title is required');
    if (!metadata.author.trim()) issues.push('Draft2Digital author is required');
    if (!metadata.description.trim()) issues.push('Draft2Digital description is required');
    if (!metadata.language.trim()) issues.push('Draft2Digital language is required');
    if (metadata.keywords.length > draft2DigitalDefaultConfiguration.maxKeywords) issues.push('Draft2Digital keyword count exceeds configured maximum');
    if (metadata.categories.length > draft2DigitalDefaultConfiguration.maxCategories) issues.push('Draft2Digital category count exceeds configured maximum');
    if (metadata.pricing.listPrice <= 0) issues.push('Draft2Digital pricing must be positive');
    return issues;
  }
  validateArtifacts(format: Draft2DigitalFormat, exportJob: ExportJobDocument | null): { issues: string[]; warnings: string[]; artifacts: Record<string, unknown>[] } {
    const issues: string[] = []; const warnings: string[] = [];
    if (!exportJob || exportJob.status !== ExportJobStatus.COMPLETED) return { issues: ['Completed export job is required for Draft2Digital package preparation'], warnings, artifacts: [] };
    const required = draft2DigitalDefaultConfiguration.requiredArtifactTypes[format];
    const artifacts = exportJob.generatedFiles.filter((artifact) => required.includes(artifact.format));
    for (const requiredFormat of required) if (!artifacts.some((artifact) => artifact.format === requiredFormat)) issues.push(`Required Draft2Digital artifact is missing: ${requiredFormat}`);
    for (const artifact of artifacts) { if (!artifact.fileSize) issues.push(`Draft2Digital artifact has zero size: ${artifact.artifactId}`); if (!artifact.checksum) issues.push(`Draft2Digital artifact checksum is missing: ${artifact.artifactId}`); }
    if (!artifacts.some((artifact) => /cover/i.test(artifact.filename))) warnings.push('Cover asset must be reviewed manually before Draft2Digital submission');
    return { issues, warnings, artifacts: artifacts.map((artifact) => ({ artifactId: artifact.artifactId, format: artifact.format, filename: artifact.filename, fileExtension: artifact.fileExtension, mimeType: artifact.mimeType, storagePath: artifact.storagePath, checksum: artifact.checksum, fileSize: artifact.fileSize })) };
  }
  validateStatusTransition(current: Draft2DigitalStatus, next: Draft2DigitalStatus): void { const allowed: Record<Draft2DigitalStatus, Draft2DigitalStatus[]> = { DRAFT: [Draft2DigitalStatus.READY_FOR_SUBMISSION, Draft2DigitalStatus.BLOCKED], READY_FOR_SUBMISSION: [Draft2DigitalStatus.SUBMISSION_RECORDED, Draft2DigitalStatus.BLOCKED], SUBMISSION_RECORDED: [Draft2DigitalStatus.IN_REVIEW, Draft2DigitalStatus.ACTION_REQUIRED], IN_REVIEW: [Draft2DigitalStatus.LIVE, Draft2DigitalStatus.ACTION_REQUIRED, Draft2DigitalStatus.REJECTED], LIVE: [], ACTION_REQUIRED: [Draft2DigitalStatus.IN_REVIEW, Draft2DigitalStatus.BLOCKED, Draft2DigitalStatus.REJECTED], BLOCKED: [Draft2DigitalStatus.READY_FOR_SUBMISSION], REJECTED: [Draft2DigitalStatus.ACTION_REQUIRED], UNKNOWN: [Draft2DigitalStatus.DRAFT, Draft2DigitalStatus.READY_FOR_SUBMISSION] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid Draft2Digital status transition from ${current} to ${next}`); }
}

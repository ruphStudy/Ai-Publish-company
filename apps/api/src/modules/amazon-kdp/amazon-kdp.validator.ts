import { BadRequestException, Injectable } from '@nestjs/common';
import { ExportFormat } from '../export/entities/export-artifact.entity';
import type { ExportJobDocument } from '../export/entities/export-job.entity';
import { ExportJobStatus } from '../export/entities/export-job.entity';
import { amazonKdpDefaultConfiguration } from './config/amazon-kdp.config';
import { AmazonKdpFormat, AmazonKdpIntegrationMode, AmazonKdpStatus } from './entities/amazon-kdp.entity';
import type { AmazonKdpMetadata } from './interfaces/amazon-kdp.interface';

@Injectable()
export class AmazonKdpValidator {
  validateConfiguration(mode = amazonKdpDefaultConfiguration.integrationMode): void { if (mode === AmazonKdpIntegrationMode.API) throw new BadRequestException('Amazon KDP API mode is unavailable until an official API adapter is configured'); }
  validateMetadata(metadata: AmazonKdpMetadata, format: AmazonKdpFormat): string[] {
    const issues: string[] = [];
    if (!metadata.title.trim()) issues.push('KDP title is required');
    if (!metadata.primaryAuthor.trim()) issues.push('KDP primary author is required');
    if (!metadata.description.trim()) issues.push('KDP description is required');
    if (!metadata.language.trim()) issues.push('KDP language is required');
    if (!metadata.primaryMarketplace.trim()) issues.push('KDP primary marketplace is required');
    if (metadata.keywords.length > amazonKdpDefaultConfiguration.maxKeywords) issues.push('KDP keyword count exceeds configured maximum');
    if (metadata.categories.length > amazonKdpDefaultConfiguration.maxCategories) issues.push('KDP category count exceeds configured maximum');
    if (/<script|<iframe/i.test(metadata.description)) issues.push('KDP description contains unsupported HTML');
    if ([AmazonKdpFormat.PAPERBACK, AmazonKdpFormat.HARDCOVER].includes(format) && amazonKdpDefaultConfiguration.isbnStrategy === 'PROVIDED' && !metadata.isbn) issues.push('ISBN is required for this print configuration');
    return issues;
  }
  validateArtifacts(format: AmazonKdpFormat, exportJob: ExportJobDocument | null): { issues: string[]; warnings: string[]; artifacts: Record<string, unknown>[] } {
    const issues: string[] = []; const warnings: string[] = [];
    if (!exportJob || exportJob.status !== ExportJobStatus.COMPLETED) return { issues: ['Completed export job is required for KDP package preparation'], warnings, artifacts: [] };
    const required = amazonKdpDefaultConfiguration.requiredArtifactTypes[format].map((value) => value as ExportFormat);
    const artifacts = exportJob.generatedFiles.filter((artifact) => required.includes(artifact.format));
    for (const requiredFormat of required) if (!artifacts.some((artifact) => artifact.format === requiredFormat)) issues.push(`Required KDP artifact is missing: ${requiredFormat}`);
    for (const artifact of artifacts) { if (!artifact.fileSize) issues.push(`KDP artifact has zero size: ${artifact.artifactId}`); if (!artifact.checksum) issues.push(`KDP artifact checksum is missing: ${artifact.artifactId}`); if (!/^[a-z0-9._-]+$/i.test(artifact.filename)) warnings.push(`KDP artifact filename should be reviewed manually: ${artifact.filename}`); }
    if ([AmazonKdpFormat.PAPERBACK, AmazonKdpFormat.HARDCOVER].includes(format)) warnings.push('KDP Print Previewer validation is required manually before submission');
    return { issues, warnings, artifacts: artifacts.map((artifact) => ({ artifactId: artifact.artifactId, format: artifact.format, filename: artifact.filename, fileExtension: artifact.fileExtension, mimeType: artifact.mimeType, storagePath: artifact.storagePath, checksum: artifact.checksum, fileSize: artifact.fileSize })) };
  }
  validateStatusTransition(current: AmazonKdpStatus, next: AmazonKdpStatus): void { const allowed: Record<AmazonKdpStatus, AmazonKdpStatus[]> = { DRAFT: [AmazonKdpStatus.READY_FOR_SUBMISSION, AmazonKdpStatus.BLOCKED], READY_FOR_SUBMISSION: [AmazonKdpStatus.SUBMISSION_RECORDED, AmazonKdpStatus.BLOCKED], SUBMISSION_RECORDED: [AmazonKdpStatus.IN_REVIEW, AmazonKdpStatus.ACTION_REQUIRED], IN_REVIEW: [AmazonKdpStatus.PUBLISHING, AmazonKdpStatus.ACTION_REQUIRED, AmazonKdpStatus.REJECTED], PUBLISHING: [AmazonKdpStatus.LIVE, AmazonKdpStatus.ACTION_REQUIRED], LIVE: [AmazonKdpStatus.UNPUBLISHED], ACTION_REQUIRED: [AmazonKdpStatus.IN_REVIEW, AmazonKdpStatus.BLOCKED, AmazonKdpStatus.REJECTED], BLOCKED: [AmazonKdpStatus.READY_FOR_SUBMISSION], REJECTED: [AmazonKdpStatus.ACTION_REQUIRED], UNPUBLISHED: [], UNKNOWN: [AmazonKdpStatus.DRAFT, AmazonKdpStatus.READY_FOR_SUBMISSION] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid KDP status transition from ${current} to ${next}`); }
}

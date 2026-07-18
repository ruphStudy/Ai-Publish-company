import { BadRequestException, Injectable } from '@nestjs/common';
import type { ExportJobDocument } from '../export/entities/export-job.entity';
import { ExportJobStatus } from '../export/entities/export-job.entity';
import { googlePlayBooksDefaultConfiguration } from './config/google-play-books.config';
import { GooglePlayBooksFileProcessingStatus, GooglePlayBooksFormat, GooglePlayBooksIdentifierStrategy, GooglePlayBooksIntegrationMode, GooglePlayBooksStatus } from './entities/google-play-books.entity';
import type { GooglePlayBooksMetadata } from './interfaces/google-play-books.interface';

@Injectable()
export class GooglePlayBooksValidator {
  validateConfiguration(mode = googlePlayBooksDefaultConfiguration.integrationMode): void { if (mode === GooglePlayBooksIntegrationMode.API) throw new BadRequestException('Google Play Books API mode is unavailable until an official publishing adapter is configured'); }
  validateMetadata(metadata: GooglePlayBooksMetadata): string[] {
    const issues: string[] = [];
    if (!metadata.title.trim()) issues.push('Google Play Books title is required');
    if (!metadata.primaryAuthor.trim()) issues.push('Google Play Books primary author is required');
    if (!metadata.description.trim()) issues.push('Google Play Books description is required');
    if (!metadata.language.trim()) issues.push('Google Play Books language is required');
    if (!metadata.publisher.trim()) issues.push('Google Play Books publisher or imprint is required');
    if (metadata.identifierStrategy === GooglePlayBooksIdentifierStrategy.ISBN && !metadata.isbn) issues.push('ISBN is required for ISBN identifier strategy');
    if (metadata.isbn && !/^(97(8|9))?\d{9}[\dX]$/i.test(metadata.isbn.replace(/-/g, ''))) issues.push('ISBN is structurally invalid');
    if (metadata.pricing.amount < 0) issues.push('Google Play Books pricing must be positive or explicitly free');
    if (!/^[A-Z]{3}$/.test(metadata.pricing.currency)) issues.push('Google Play Books pricing currency is invalid');
    if (metadata.previewPercentage < 0 || metadata.previewPercentage > 100) issues.push('Google Play Books preview percentage is invalid');
    if (!metadata.salesTerritories.length) issues.push('Google Play Books sales territories are required');
    if (/<script|<iframe/i.test(metadata.description)) issues.push('Google Play Books description contains unsupported markup');
    return issues;
  }
  validateArtifacts(format: GooglePlayBooksFormat, exportJob: ExportJobDocument | null): { issues: string[]; warnings: string[]; artifacts: Record<string, unknown>[] } {
    const issues: string[] = []; const warnings: string[] = [];
    if (!exportJob || exportJob.status !== ExportJobStatus.COMPLETED) return { issues: ['Completed export job is required for Google Play Books package preparation'], warnings, artifacts: [] };
    const required = googlePlayBooksDefaultConfiguration.requiredContentArtifacts[format];
    const artifacts = exportJob.generatedFiles.filter((artifact) => required.includes(artifact.format));
    for (const requiredFormat of required) if (!artifacts.some((artifact) => artifact.format === requiredFormat)) issues.push(`Required Google Play Books artifact is missing: ${requiredFormat}`);
    for (const artifact of artifacts) { if (!artifact.fileSize) issues.push(`Google Play Books artifact has zero size: ${artifact.artifactId}`); if (artifact.fileSize > googlePlayBooksDefaultConfiguration.maxFileSizeBytes) issues.push(`Google Play Books artifact exceeds configured maximum size: ${artifact.artifactId}`); if (!artifact.checksum) issues.push(`Google Play Books artifact checksum is missing: ${artifact.artifactId}`); if (!/^[a-z0-9._-]+$/i.test(artifact.filename)) warnings.push(`Google Play Books artifact filename should be reviewed manually: ${artifact.filename}`); }
    warnings.push('Google Play Books Partner Center processing must be reviewed manually after upload');
    return { issues, warnings, artifacts: artifacts.map((artifact) => ({ artifactId: artifact.artifactId, format: artifact.format, filename: artifact.filename, fileExtension: artifact.fileExtension, mimeType: artifact.mimeType, storagePath: artifact.storagePath, checksum: artifact.checksum, fileSize: artifact.fileSize })) };
  }
  validateStatusTransition(current: GooglePlayBooksStatus, next: GooglePlayBooksStatus): void { const allowed: Record<GooglePlayBooksStatus, GooglePlayBooksStatus[]> = { DRAFT: [GooglePlayBooksStatus.READY_FOR_SUBMISSION, GooglePlayBooksStatus.BLOCKED], READY_FOR_SUBMISSION: [GooglePlayBooksStatus.SUBMISSION_RECORDED, GooglePlayBooksStatus.BLOCKED], SUBMISSION_RECORDED: [GooglePlayBooksStatus.PROCESSING, GooglePlayBooksStatus.IN_REVIEW, GooglePlayBooksStatus.ACTION_REQUIRED], PROCESSING: [GooglePlayBooksStatus.IN_REVIEW, GooglePlayBooksStatus.ACTION_REQUIRED, GooglePlayBooksStatus.REJECTED], IN_REVIEW: [GooglePlayBooksStatus.PUBLISHING, GooglePlayBooksStatus.ACTION_REQUIRED, GooglePlayBooksStatus.REJECTED], PUBLISHING: [GooglePlayBooksStatus.LIVE, GooglePlayBooksStatus.ACTION_REQUIRED], LIVE: [GooglePlayBooksStatus.REMOVED], ACTION_REQUIRED: [GooglePlayBooksStatus.PROCESSING, GooglePlayBooksStatus.IN_REVIEW, GooglePlayBooksStatus.BLOCKED, GooglePlayBooksStatus.REJECTED], BLOCKED: [GooglePlayBooksStatus.READY_FOR_SUBMISSION], REJECTED: [GooglePlayBooksStatus.ACTION_REQUIRED], REMOVED: [], UNKNOWN: [GooglePlayBooksStatus.DRAFT, GooglePlayBooksStatus.READY_FOR_SUBMISSION] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid Google Play Books status transition from ${current} to ${next}`); }
  validateProcessingTransition(current: GooglePlayBooksFileProcessingStatus, next: GooglePlayBooksFileProcessingStatus): void { const allowed: Record<GooglePlayBooksFileProcessingStatus, GooglePlayBooksFileProcessingStatus[]> = { PENDING: [GooglePlayBooksFileProcessingStatus.PROCESSING, GooglePlayBooksFileProcessingStatus.REPLACED], PROCESSING: [GooglePlayBooksFileProcessingStatus.PROCESSED, GooglePlayBooksFileProcessingStatus.ACTION_REQUIRED, GooglePlayBooksFileProcessingStatus.FAILED, GooglePlayBooksFileProcessingStatus.REPLACED], PROCESSED: [GooglePlayBooksFileProcessingStatus.REPLACED], ACTION_REQUIRED: [GooglePlayBooksFileProcessingStatus.PROCESSING, GooglePlayBooksFileProcessingStatus.REPLACED], FAILED: [GooglePlayBooksFileProcessingStatus.REPLACED], REPLACED: [GooglePlayBooksFileProcessingStatus.PROCESSING] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid Google Play Books processing transition from ${current} to ${next}`); }
}

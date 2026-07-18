import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ComplianceCategory, ComplianceLevel, ComplianceValidation, ComplianceValidationScope, ComplianceValidationStatus, ComplianceValidationTargetType } from './entities/compliance-validation.entity';
import type { ComplianceAnalysisResult } from './interfaces/compliance-validation.interface';

@Injectable()
export class ComplianceValidationFactory {
  create(input: { projectId: string; targetType: ComplianceValidationTargetType; targetId: string; manuscriptVersion: string; scope: ComplianceValidationScope; complianceVersion: number; createdBy?: string }, result: ComplianceAnalysisResult): Partial<ComplianceValidation> {
    const score = (categories: ComplianceCategory[]) => this.score([...result.failedChecks, ...result.warnings].filter((check) => categories.includes(check.category)));
    const structuralScore = score([ComplianceCategory.BOOK_STRUCTURE, ComplianceCategory.TABLE_OF_CONTENTS, ComplianceCategory.CHAPTER_ORGANIZATION, ComplianceCategory.HEADING_HIERARCHY, ComplianceCategory.MARKDOWN_VALIDATION, ComplianceCategory.HTML_VALIDATION]);
    const metadataScore = score([ComplianceCategory.METADATA_COMPLETENESS, ComplianceCategory.ISBN_READINESS, ComplianceCategory.COPYRIGHT_PAGE, ComplianceCategory.DISCLAIMER_PRESENCE, ComplianceCategory.AUTHOR_INFORMATION, ComplianceCategory.CATEGORY_ASSIGNMENT, ComplianceCategory.LANGUAGE_CONSISTENCY]);
    const accessibilityScore = score([ComplianceCategory.ACCESSIBILITY_VALIDATION, ComplianceCategory.IMAGE_REFERENCE_VALIDATION, ComplianceCategory.INTERNAL_LINK_VALIDATION]);
    const seoScore = score([ComplianceCategory.SEO_METADATA, ComplianceCategory.KEYWORD_COVERAGE]);
    const exportReadinessScore = score([ComplianceCategory.EPUB_READINESS, ComplianceCategory.PDF_READINESS, ComplianceCategory.DOCX_READINESS, ComplianceCategory.PRINT_READINESS, ComplianceCategory.FILE_NAMING, ComplianceCategory.VERSION_CONSISTENCY, ComplianceCategory.PUBLICATION_CONFIGURATION, ComplianceCategory.EXPORT_DEPENDENCY_VALIDATION]);
    const publicationReadinessScore = Math.round((structuralScore + metadataScore + accessibilityScore + seoScore + exportReadinessScore) / 5);
    const overallScore = publicationReadinessScore;
    const blockingIssueCount = result.failedChecks.length;
    const warningCount = result.warnings.length;
    const complianceLevel = blockingIssueCount > 0 ? ComplianceLevel.FAIL : warningCount > 0 ? ComplianceLevel.WARNING : ComplianceLevel.PASS;
    return { validationId: `CV-${randomUUID()}`, ...input, ...result, overallScore, structuralScore, metadataScore, accessibilityScore, seoScore, exportReadinessScore, publicationReadinessScore, complianceLevel, blockingIssueCount, warningCount, recommendationCount: result.recommendations.length, status: ComplianceValidationStatus.COMPLETED, failureCode: null, failureMessage: null, isDeleted: false, createdBy: input.createdBy ?? null, updatedBy: input.createdBy ?? null };
  }
  private score(checks: { severity: string }[]): number { const penalty = checks.reduce((total, check) => total + ({ INFO: 0, LOW: 4, MEDIUM: 8, HIGH: 18, CRITICAL: 35 }[check.severity] ?? 0), 0); return Math.max(0, 100 - penalty); }
}

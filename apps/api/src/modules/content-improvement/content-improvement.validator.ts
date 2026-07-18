import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { QualityIssueSeverity, QualityReviewStatus } from '../quality-review/entities/quality-review.entity';
import { ContentImprovementDocument, ContentImprovementStatus } from './entities/content-improvement.entity';

@Injectable()
export class ContentImprovementValidator {
  validateReview(review: { status: QualityReviewStatus }): void { if (review.status !== QualityReviewStatus.COMPLETED && review.status !== QualityReviewStatus.APPROVED) throw new BadRequestException('Quality review must be completed'); }
  validateTarget(projectId: string, target: { projectId: string; generatedContent?: string; markdownContent?: string }): void { if (String(target.projectId) !== projectId) throw new BadRequestException('Target does not belong to the project'); if (!String(target.markdownContent ?? target.generatedContent ?? '').trim()) throw new BadRequestException('Target content is empty'); }
  validateTransition(current: ContentImprovementStatus, next: ContentImprovementStatus): void {
    const allowed: Record<ContentImprovementStatus, ContentImprovementStatus[]> = { PENDING: [ContentImprovementStatus.PROCESSING, ContentImprovementStatus.REJECTED], PROCESSING: [ContentImprovementStatus.COMPLETED, ContentImprovementStatus.FAILED], COMPLETED: [ContentImprovementStatus.APPROVED, ContentImprovementStatus.REJECTED], APPROVED: [ContentImprovementStatus.APPLIED, ContentImprovementStatus.REJECTED], REJECTED: [], APPLIED: [], FAILED: [ContentImprovementStatus.PROCESSING] };
    if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid content improvement status transition from ${current} to ${next}`);
  }
  validateApproval(item: ContentImprovementDocument): void { this.validateTransition(item.status, ContentImprovementStatus.APPROVED); if (!item.improvedContent.trim()) throw new BadRequestException('Completed improvement output is required'); }
  validateApplication(item: ContentImprovementDocument, review: { issues: Array<{ severity: QualityIssueSeverity }> }): void { if (item.status === ContentImprovementStatus.APPLIED || item.appliedContentVersionIds.length) throw new ConflictException('Improvement has already been applied'); if (item.status !== ContentImprovementStatus.APPROVED) throw new BadRequestException('Improvement must be approved before application'); if (review.issues.some((issue) => issue.severity === QualityIssueSeverity.CRITICAL)) throw new BadRequestException('Critical factual changes require manual application'); }
}

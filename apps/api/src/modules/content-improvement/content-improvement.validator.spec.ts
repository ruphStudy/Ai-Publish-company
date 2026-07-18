import { BadRequestException, ConflictException } from '@nestjs/common';
import { QualityIssueSeverity, QualityReviewStatus } from '../quality-review/entities/quality-review.entity';
import type { ContentImprovementDocument } from './entities/content-improvement.entity';
import { ContentImprovementStatus } from './entities/content-improvement.entity';
import { ContentImprovementValidator } from './content-improvement.validator';

describe('ContentImprovementValidator', () => {
  const validator = new ContentImprovementValidator();
  const item = (status: ContentImprovementStatus, appliedContentVersionIds: string[] = []) => ({ status, improvedContent: '# Improved', appliedContentVersionIds } as ContentImprovementDocument);

  it('rejects an incomplete quality review', () => {
    expect(() => validator.validateReview({ status: QualityReviewStatus.REVIEWING })).toThrow(BadRequestException);
  });

  it('rejects missing content and project-target mismatch', () => {
    expect(() => validator.validateTarget('one', { projectId: 'two', generatedContent: 'content' })).toThrow('does not belong');
    expect(() => validator.validateTarget('one', { projectId: 'one', generatedContent: '' })).toThrow('empty');
  });

  it('supports approval and rejection transitions', () => {
    expect(() => validator.validateApproval(item(ContentImprovementStatus.COMPLETED))).not.toThrow();
    expect(() => validator.validateTransition(ContentImprovementStatus.COMPLETED, ContentImprovementStatus.REJECTED)).not.toThrow();
  });

  it('prevents duplicate application and critical automatic application', () => {
    expect(() => validator.validateApplication(item(ContentImprovementStatus.APPLIED, ['content']), { issues: [] })).toThrow(ConflictException);
    expect(() => validator.validateApplication(item(ContentImprovementStatus.APPROVED), { issues: [{ severity: QualityIssueSeverity.CRITICAL }] })).toThrow(BadRequestException);
  });
});

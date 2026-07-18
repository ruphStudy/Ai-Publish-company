import { BadRequestException } from '@nestjs/common';
import { QualityReviewStatus } from './entities/quality-review.entity';
import { QualityReviewValidator } from './quality-review.validator';

describe('QualityReviewValidator', () => {
  const validator = new QualityReviewValidator();

  it('rejects review input without generated content', () => {
    expect(() => validator.validateInput({ projectId: 'project', blueprintId: 'blueprint', chapters: [] }))
      .toThrow(BadRequestException);
  });

  it('enforces approval status transitions', () => {
    expect(() => validator.validateStatus(QualityReviewStatus.COMPLETED, QualityReviewStatus.APPROVED))
      .not.toThrow();
    expect(() => validator.validateStatus(QualityReviewStatus.APPROVED, QualityReviewStatus.REVIEWING))
      .toThrow(BadRequestException);
  });
});

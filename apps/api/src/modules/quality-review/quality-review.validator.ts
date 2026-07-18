import { BadRequestException, Injectable } from '@nestjs/common';
import { QualityReviewStatus } from './entities/quality-review.entity';
import { QualityReviewInput } from './interfaces/quality-review-strategy.interface';

@Injectable()
export class QualityReviewValidator {
  validateInput(input: QualityReviewInput): void {
    if (!input.projectId || !input.blueprintId) throw new BadRequestException('Project and blueprint are required');
    if (!input.chapters.length) throw new BadRequestException('Generated manuscript content is required for quality review');
    if (input.chapters.some((chapter) => !chapter.id || !chapter.plainText.trim())) throw new BadRequestException('All reviewed chapters must contain persisted text content');
    const numbers = input.chapters.map((chapter) => chapter.chapterNumber);
    if (new Set(numbers).size !== numbers.length) throw new BadRequestException('Reviewed chapter numbers must be unique');
  }

  validateStatus(current: QualityReviewStatus, requested?: QualityReviewStatus): void {
    if (!requested || requested === current) return;
    const allowed: Record<QualityReviewStatus, QualityReviewStatus[]> = {
      PENDING: [QualityReviewStatus.REVIEWING],
      REVIEWING: [QualityReviewStatus.COMPLETED, QualityReviewStatus.REJECTED],
      COMPLETED: [QualityReviewStatus.APPROVED, QualityReviewStatus.REJECTED],
      APPROVED: [],
      REJECTED: [QualityReviewStatus.REVIEWING],
    };
    if (!allowed[current].includes(requested)) throw new BadRequestException(`Invalid quality review status transition from ${current} to ${requested}`);
  }
}

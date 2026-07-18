import { Injectable } from '@nestjs/common';
import { QualityIssueSeverity, QualityReviewCategory } from '../entities/quality-review.entity';
import { QualityReviewInput, QualityReviewStrategy, QualityStrategyResult } from '../interfaces/quality-review-strategy.interface';

@Injectable()
export class StructuralQualityStrategy implements QualityReviewStrategy {
  readonly name = 'structural-quality';

  evaluate(input: QualityReviewInput): QualityStrategyResult {
    const counts = input.chapters.map((chapter) => chapter.wordCount);
    const average = counts.length ? counts.reduce((sum, count) => sum + count, 0) / counts.length : 0;
    const imbalance = average ? Math.max(...counts.map((count) => Math.abs(count - average) / average)) : 1;
    const balanced = Math.max(0, Math.round(100 - imbalance * 100));
    const formatted = input.chapters.filter((chapter) => /^#{1,6}\s/m.test(chapter.markdown)).length;
    const formatting = input.chapters.length ? Math.round((formatted / input.chapters.length) * 100) : 0;
    const complete = input.chapters.filter((chapter) => chapter.wordCount >= 100 && chapter.chapterTitle.trim()).length;
    const completeness = input.chapters.length ? Math.round((complete / input.chapters.length) * 100) : 0;
    const issues = [];
    if (balanced < 60) issues.push({ category: QualityReviewCategory.CHAPTER_BALANCE, severity: QualityIssueSeverity.MEDIUM, message: 'Chapter word counts are materially imbalanced.', suggestion: 'Rebalance chapter depth and coverage.' });
    if (completeness < 100) issues.push({ category: QualityReviewCategory.COMPLETENESS, severity: QualityIssueSeverity.HIGH, message: 'One or more chapters are incomplete.', suggestion: 'Complete all chapter content before approval.' });
    return { scores: [
      { category: QualityReviewCategory.STRUCTURE, score: input.chapters.length ? 90 : 0, weight: 0.09 },
      { category: QualityReviewCategory.CHAPTER_BALANCE, score: balanced, weight: 0.07 },
      { category: QualityReviewCategory.FORMATTING, score: formatting, weight: 0.07 },
      { category: QualityReviewCategory.COMPLETENESS, score: completeness, weight: 0.08 },
    ], issues };
  }
}

import { Injectable } from '@nestjs/common';
import { QualityIssueSeverity, QualityReviewCategory } from '../entities/quality-review.entity';
import { QualityReviewInput, QualityReviewStrategy, QualityStrategyResult } from '../interfaces/quality-review-strategy.interface';

@Injectable()
export class ContentQualityStrategy implements QualityReviewStrategy {
  readonly name = 'content-quality';

  evaluate(input: QualityReviewInput): QualityStrategyResult {
    const paragraphs = input.chapters.flatMap((chapter) => chapter.plainText.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean));
    const normalized = paragraphs.map((item) => item.toLowerCase().replace(/\W+/g, ' ').trim());
    const duplicates = normalized.length - new Set(normalized).size;
    const phrases = normalized.flatMap((item) => item.split(' ').slice(0, -5).map((_, index, words) => words.slice(index, index + 6).join(' ')));
    const repeatedPhrases = phrases.length - new Set(phrases).size;
    const duplicateScore = Math.max(0, 100 - duplicates * 20);
    const repetitionScore = Math.max(0, 100 - Math.min(40, repeatedPhrases));
    const issues = [];
    if (duplicates > 0) issues.push({ category: QualityReviewCategory.DUPLICATE_CONTENT, severity: QualityIssueSeverity.HIGH, message: `${duplicates} duplicate paragraph(s) detected.`, suggestion: 'Remove or consolidate duplicate passages.' });
    return { scores: [
      { category: QualityReviewCategory.CONSISTENCY, score: input.chapters.length ? 90 : 0, weight: 0.08 },
      { category: QualityReviewCategory.DUPLICATE_CONTENT, score: duplicateScore, weight: 0.1 },
      { category: QualityReviewCategory.AI_REPETITION, score: repetitionScore, weight: 0.1 },
      { category: QualityReviewCategory.SEO, score: normalized.join(' ').length ? 80 : 0, weight: 0.06 },
    ], issues };
  }
}

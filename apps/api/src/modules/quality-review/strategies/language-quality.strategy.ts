import { Injectable } from '@nestjs/common';
import { QualityIssueSeverity, QualityReviewCategory } from '../entities/quality-review.entity';
import { QualityReviewInput, QualityReviewStrategy, QualityStrategyResult } from '../interfaces/quality-review-strategy.interface';

@Injectable()
export class LanguageQualityStrategy implements QualityReviewStrategy {
  readonly name = 'language-quality';

  evaluate(input: QualityReviewInput): QualityStrategyResult {
    const text = input.chapters.map((chapter) => chapter.plainText).join(' ');
    const words = text.match(/[A-Za-z']+/g) ?? [];
    const sentences = text.split(/[.!?]+/).filter((item) => item.trim()).length;
    const longSentences = text.split(/[.!?]+/).filter((item) => item.trim().split(/\s+/).length > 30).length;
    const repeatedSpaces = (text.match(/\s{2,}/g) ?? []).length;
    const readability = sentences ? Math.max(0, 100 - Math.round((words.length / sentences - 18) * 2.5) - longSentences * 3) : 0;
    const grammar = Math.max(0, 100 - repeatedSpaces * 3 - longSentences * 2);
    const spelling = Math.max(0, 100 - (text.match(/\b\w*([a-z])\1\1\w*\b/gi) ?? []).length * 5);
    const issues = [];
    if (readability < 70) issues.push({ category: QualityReviewCategory.READABILITY, severity: QualityIssueSeverity.MEDIUM, message: 'Sentence complexity reduces readability.', suggestion: 'Shorten long sentences and vary sentence length.' });
    return { scores: [
      { category: QualityReviewCategory.GRAMMAR, score: grammar, weight: 0.1 },
      { category: QualityReviewCategory.SPELLING, score: spelling, weight: 0.08 },
      { category: QualityReviewCategory.READABILITY, score: readability, weight: 0.1 },
      { category: QualityReviewCategory.TONE, score: words.length ? 88 : 0, weight: 0.07 },
    ], issues };
  }
}

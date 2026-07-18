import { QualityReviewEngine } from './quality-review.engine';
import { QualityReviewFactory } from './quality-review.factory';
import { ContentQualityStrategy } from './strategies/content-quality.strategy';
import { LanguageQualityStrategy } from './strategies/language-quality.strategy';
import { StructuralQualityStrategy } from './strategies/structural-quality.strategy';
import { PublicationReadiness, QualityReviewCategory, QualityReviewStatus } from './entities/quality-review.entity';

describe('QualityReviewEngine', () => {
  const input = {
    projectId: '507f1f77bcf86cd799439011',
    blueprintId: '507f1f77bcf86cd799439012',
    chapters: [{
      id: '507f1f77bcf86cd799439013',
      chapterNumber: 1,
      chapterTitle: 'Validation',
      markdown: '# Validation\n\nA complete and readable validation chapter. '.repeat(30),
      plainText: 'A complete and readable validation chapter. '.repeat(30),
      wordCount: 180,
    }],
  };

  it('produces every required category score and a publication decision', () => {
    const engine = new QualityReviewEngine(
      new LanguageQualityStrategy(),
      new ContentQualityStrategy(),
      new StructuralQualityStrategy(),
    );
    const result = engine.review(input);
    const review = new QualityReviewFactory().create(input, result, 'v1');

    expect(new Set(result.scores.map((item) => item.category))).toEqual(
      new Set(Object.values(QualityReviewCategory)),
    );
    expect(review.overallQualityScore).toBeGreaterThanOrEqual(0);
    expect(review.overallQualityScore).toBeLessThanOrEqual(100);
    expect(Object.values(PublicationReadiness)).toContain(review.publicationReadiness);
    expect(review.status).toBe(QualityReviewStatus.COMPLETED);
  });
});

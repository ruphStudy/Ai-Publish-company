import { Injectable } from '@nestjs/common';
import { ContentQualityStrategy } from './strategies/content-quality.strategy';
import { LanguageQualityStrategy } from './strategies/language-quality.strategy';
import { StructuralQualityStrategy } from './strategies/structural-quality.strategy';
import { QualityReviewInput, QualityReviewStrategy, QualityStrategyResult } from './interfaces/quality-review-strategy.interface';

@Injectable()
export class QualityReviewEngine {
  private readonly strategies: QualityReviewStrategy[];

  constructor(language: LanguageQualityStrategy, content: ContentQualityStrategy, structural: StructuralQualityStrategy) {
    this.strategies = [language, content, structural];
  }

  review(input: QualityReviewInput): QualityStrategyResult {
    return this.strategies.reduce<QualityStrategyResult>((result, strategy) => {
      const current = strategy.evaluate(input);
      result.scores.push(...current.scores);
      result.issues.push(...current.issues);
      return result;
    }, { scores: [], issues: [] });
  }
}

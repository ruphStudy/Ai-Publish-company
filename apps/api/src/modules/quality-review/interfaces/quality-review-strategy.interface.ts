import type { QualityCategoryScore, QualityIssue } from '../entities/quality-review.entity';

export interface QualityReviewInput {
  projectId: string;
  blueprintId: string;
  chapters: Array<{
    id: string;
    chapterNumber: number;
    chapterTitle: string;
    markdown: string;
    plainText: string;
    wordCount: number;
  }>;
}

export interface QualityStrategyResult {
  scores: QualityCategoryScore[];
  issues: QualityIssue[];
}

export interface QualityReviewStrategy {
  readonly name: string;
  evaluate(input: QualityReviewInput): QualityStrategyResult;
}

import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PublicationReadiness, QualityIssueSeverity, QualityReview, QualityReviewStatus } from './entities/quality-review.entity';
import { QualityReviewInput, QualityStrategyResult } from './interfaces/quality-review-strategy.interface';

@Injectable()
export class QualityReviewFactory {
  create(input: QualityReviewInput, result: QualityStrategyResult, reviewVersion: string, createdBy?: string): Partial<QualityReview> {
    const totalWeight = result.scores.reduce((sum, item) => sum + item.weight, 0);
    const overallQualityScore = totalWeight
      ? Math.round(result.scores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight)
      : 0;
    const severity = this.highestSeverity(result.issues.map((issue) => issue.severity));
    const publicationReadiness = this.readiness(overallQualityScore, severity);

    return {
      reviewId: `QRE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8).toUpperCase()}`,
      projectId: input.projectId,
      blueprintId: input.blueprintId,
      contentIds: input.chapters.map((chapter) => chapter.id),
      overallQualityScore,
      categoryScores: result.scores,
      issues: result.issues,
      suggestions: [...new Set(result.issues.map((issue) => issue.suggestion).filter((value): value is string => Boolean(value)))],
      severity,
      publicationReadiness,
      reviewVersion,
      status: QualityReviewStatus.COMPLETED,
      metadata: { strategyCount: 3, chapterCount: input.chapters.length, reviewedAt: new Date().toISOString() },
      createdBy: createdBy ?? null,
      updatedBy: createdBy ?? null,
    };
  }

  private highestSeverity(severities: QualityIssueSeverity[]): QualityIssueSeverity {
    const order = [QualityIssueSeverity.INFO, QualityIssueSeverity.LOW, QualityIssueSeverity.MEDIUM, QualityIssueSeverity.HIGH, QualityIssueSeverity.CRITICAL];
    return severities.reduce((highest, severity) => order.indexOf(severity) > order.indexOf(highest) ? severity : highest, QualityIssueSeverity.INFO);
  }

  private readiness(score: number, severity: QualityIssueSeverity): PublicationReadiness {
    if (severity === QualityIssueSeverity.CRITICAL || score < 60) return PublicationReadiness.NOT_READY;
    if (severity === QualityIssueSeverity.HIGH || score < 80) return PublicationReadiness.NEEDS_REVIEW;
    return PublicationReadiness.READY;
  }
}

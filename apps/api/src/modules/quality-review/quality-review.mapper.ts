import { Injectable } from '@nestjs/common';
import { QualityReviewDocument } from './entities/quality-review.entity';

@Injectable()
export class QualityReviewMapper {
  toResponse(document: QualityReviewDocument) {
    return {
      id: document.id,
      reviewId: document.reviewId,
      projectId: document.projectId,
      blueprintId: document.blueprintId,
      contentIds: document.contentIds,
      overallQualityScore: document.overallQualityScore,
      categoryScores: document.categoryScores,
      issues: document.issues,
      suggestions: document.suggestions,
      severity: document.severity,
      publicationReadiness: document.publicationReadiness,
      reviewVersion: document.reviewVersion,
      status: document.status,
      metadata: document.metadata,
      version: document.get('version') as number,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}

import { Injectable } from '@nestjs/common';

import { TrendSnapshotData } from './models/trend-history.model';

export interface TrendHistoryValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class TrendHistoryValidator {
  validateSnapshot(snapshot: TrendSnapshotData): TrendHistoryValidationResult {
    const errors: string[] = [];

    if (!snapshot.knowledgeRecordId) {
      errors.push('knowledgeRecordId is required');
    }

    if (!snapshot.provider) {
      errors.push('provider is required');
    }

    if (!snapshot.externalId.trim()) {
      errors.push('externalId is required');
    }

    if (!snapshot.snapshotVersion.trim()) {
      errors.push('snapshotVersion is required');
    }

    if (Number.isNaN(snapshot.snapshotDate.getTime())) {
      errors.push('snapshotDate must be valid');
    }

    if (!this.isValidScore(snapshot.trendScore)) {
      errors.push('trendScore must be between 0 and 100');
    }

    if (!this.isValidScore(snapshot.opportunityScore)) {
      errors.push('opportunityScore must be between 0 and 100');
    }

    if (!this.isValidScore(snapshot.demandScore)) {
      errors.push('demandScore must be between 0 and 100');
    }

    if (!this.isValidScore(snapshot.competitionScore)) {
      errors.push('competitionScore must be between 0 and 100');
    }

    if (
      snapshot.searchVolume !== null &&
      (!Number.isFinite(snapshot.searchVolume) || snapshot.searchVolume < 0)
    ) {
      errors.push('searchVolume must be non-negative');
    }

    if (
      snapshot.rating !== null &&
      (!Number.isFinite(snapshot.rating) ||
        snapshot.rating < 0 ||
        snapshot.rating > 5)
    ) {
      errors.push('rating must be between 0 and 5');
    }

    if (
      snapshot.reviewCount !== null &&
      (!Number.isFinite(snapshot.reviewCount) || snapshot.reviewCount < 0)
    ) {
      errors.push('reviewCount must be non-negative');
    }

    if (
      snapshot.price !== null &&
      (!Number.isFinite(snapshot.price) || snapshot.price < 0)
    ) {
      errors.push('price must be non-negative');
    }

    if (!this.isValidMetadata(snapshot.metadata)) {
      errors.push('metadata must be JSON-compatible');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private isValidScore(value: number | null): boolean {
    return (
      value === null ||
      (Number.isFinite(value) && value >= 0 && value <= 100)
    );
  }

  private isValidMetadata(value: Record<string, unknown>): boolean {
    try {
      JSON.stringify(value);
      return true;
    } catch {
      return false;
    }
  }
}
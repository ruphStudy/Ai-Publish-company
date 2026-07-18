import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ClaimSupportStatus, FactConsistencyCategory, FactConsistencyIssue, FactIssueSeverity } from '../entities/fact-consistency.entity';
import type { ExtractedClaim } from '../entities/fact-consistency.entity';
import type { FactConsistencyInput, FactConsistencyStrategy } from '../interfaces/fact-consistency.interface';

@Injectable()
export class DeterministicConsistencyStrategy implements FactConsistencyStrategy {
  analyze(_input: FactConsistencyInput, claims: ExtractedClaim[]): FactConsistencyIssue[] {
    const issues: FactConsistencyIssue[] = [];
    for (let leftIndex = 0; leftIndex < claims.length; leftIndex += 1) for (let rightIndex = leftIndex + 1; rightIndex < claims.length; rightIndex += 1) {
      const left = claims[leftIndex]; const right = claims[rightIndex];
      if (left.normalizedText !== right.normalizedText) continue;
      const numericConflict = left.numericValues.join(',') !== right.numericValues.join(',');
      const dateConflict = left.dates.join(',') !== right.dates.join(',');
      if (!numericConflict && !dateConflict) continue;
      const crossChapter = Boolean(left.chapterId && right.chapterId && left.chapterId !== right.chapterId);
      const category = numericConflict ? FactConsistencyCategory.NUMERIC_INCONSISTENCY : FactConsistencyCategory.DATE_INCONSISTENCY;
      const issue = this.issue(category, FactIssueSeverity.CRITICAL, `Conflicting ${numericConflict ? 'numeric values' : 'dates'} were found for equivalent claims.`, left, right, true);
      const contradiction = this.issue(crossChapter ? FactConsistencyCategory.CROSS_CHAPTER_CONTRADICTION : FactConsistencyCategory.INTERNAL_CONTRADICTION, FactIssueSeverity.CRITICAL, `Equivalent claims conflict ${crossChapter ? 'across chapters' : 'within the content'}.`, left, right, true);
      issues.push(issue, contradiction); left.supportStatus = ClaimSupportStatus.CONTRADICTED; right.supportStatus = ClaimSupportStatus.CONTRADICTED; left.contradictionIds.push(issue.issueId, contradiction.issueId); right.contradictionIds.push(issue.issueId, contradiction.issueId); left.relatedClaimIds.push(right.claimId); right.relatedClaimIds.push(left.claimId);
    }
    return issues;
  }
  private issue(category: FactConsistencyCategory, severity: FactIssueSeverity, message: string, left: ExtractedClaim, right: ExtractedClaim, blockingPublication: boolean): FactConsistencyIssue { return { issueId: `FCI-${randomUUID()}`, category, severity, message, sourceLocation: left.sourceLocation, relatedLocations: [right.sourceLocation], claimIds: [left.claimId, right.claimId], evidence: [left.text, right.text], recommendation: 'Reconcile the claims against an authoritative source and retain one supported value.', confidence: 98, blockingPublication }; }
}

import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ClaimSupportStatus, FactConsistencyCategory, FactConsistencyIssue, FactIssueSeverity } from '../entities/fact-consistency.entity';
import type { ExtractedClaim } from '../entities/fact-consistency.entity';
import type { FactConsistencyInput, FactConsistencyStrategy } from '../interfaces/fact-consistency.interface';

@Injectable()
export class SupportConsistencyStrategy implements FactConsistencyStrategy {
  analyze(_input: FactConsistencyInput, claims: ExtractedClaim[]): FactConsistencyIssue[] { return claims.filter((claim) => !claim.citations.length).flatMap((claim) => { claim.supportStatus = ClaimSupportStatus.UNCERTAIN; return [this.issue(claim, FactConsistencyCategory.CITATION_MISSING, 'A factual claim has no citation.'), this.issue(claim, FactConsistencyCategory.UNSUPPORTED_CLAIM, 'The claim was not externally verified and remains uncertain.')]; }); }
  private issue(claim: ExtractedClaim, category: FactConsistencyCategory, message: string): FactConsistencyIssue { return { issueId: `FCI-${randomUUID()}`, category, severity: category === FactConsistencyCategory.CITATION_MISSING ? FactIssueSeverity.MEDIUM : FactIssueSeverity.LOW, message, sourceLocation: claim.sourceLocation, relatedLocations: [], claimIds: [claim.claimId], evidence: [claim.text], recommendation: 'Add and verify an authoritative citation before publication.', confidence: 95, blockingPublication: false }; }
}

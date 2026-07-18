import { Injectable } from '@nestjs/common';

@Injectable()
export class OpportunityConfidenceCalculator {
  calculate(input: { dataCompleteness?: number; evidenceStrength?: number; conflictingEvidence?: number }): number { return Math.max(0, Math.min(100, ((input.dataCompleteness ?? 0.75) * 50) + ((input.evidenceStrength ?? 0.75) * 50) - ((input.conflictingEvidence ?? 0) * 10))); }
}

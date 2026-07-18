import { Injectable } from '@nestjs/common';

@Injectable()
export class OpportunityConflictResolver {
  detect(input: { opportunityType: string; entityId?: string | null }): string[] { return input.opportunityType.includes('PRICE_TOO_LOW') || input.opportunityType.includes('PRICE_TOO_HIGH') ? ['POTENTIAL_PRICE_SIGNAL_CONFLICT'] : []; }
}

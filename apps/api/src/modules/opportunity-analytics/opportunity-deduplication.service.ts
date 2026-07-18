import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OpportunityDeduplicationService {
  fingerprint(input: Record<string, unknown>): string { return createHash('sha256').update(JSON.stringify(input)).digest('hex'); }
}

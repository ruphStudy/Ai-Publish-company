import { Injectable } from '@nestjs/common';

@Injectable()
export class NormalizationConflictResolver {
  detect(existing: unknown, nextFingerprint: string): Record<string, unknown>[] { return existing ? [{ type: 'DUPLICATE_CANONICAL_RECORD', canonicalFingerprint: nextFingerprint }] : []; }
}

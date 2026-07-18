import { Injectable } from '@nestjs/common';
import { BookMatchStatus } from './entities/sales-royalty-normalization.entity';
import type { BookResolutionResult } from './interfaces/sales-royalty-normalization.interface';

@Injectable()
export class BookEditionResolutionService {
  resolve(input: { projectId?: string | null; bookId?: string | null; editionId?: string | null; format?: string | null }): BookResolutionResult { return { projectId: input.projectId ?? 'unmatched', bookId: input.bookId ?? null, editionId: input.editionId ?? null, bookMatchStatus: input.bookId ? BookMatchStatus.MATCHED : BookMatchStatus.MANUAL_MAPPING_REQUIRED, editionMatchStatus: input.editionId ? BookMatchStatus.MATCHED : BookMatchStatus.MANUAL_MAPPING_REQUIRED, evidence: { strategy: input.bookId ? 'EXACT_IDENTIFIER' : 'MANUAL_MAPPING_REQUIRED', format: input.format ?? null } }; }
}

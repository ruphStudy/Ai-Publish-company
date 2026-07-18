import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { FactConsistencyStatus } from './entities/fact-consistency.entity';

@Injectable()
export class FactConsistencyValidator {
  validateTarget(projectId: string, target: { projectId: string; contentVersion: string; markdownContent: string }, requestedVersion: string): void { if (target.projectId !== projectId) throw new BadRequestException('Target does not belong to the project'); if (!target.markdownContent.trim()) throw new BadRequestException('Manuscript target is empty'); if (target.contentVersion !== requestedVersion) throw new ConflictException('Manuscript version mismatch'); }
  validateTransition(current: FactConsistencyStatus, next: FactConsistencyStatus): void { const allowed: Record<FactConsistencyStatus, FactConsistencyStatus[]> = { PENDING: [FactConsistencyStatus.PROCESSING], PROCESSING: [FactConsistencyStatus.COMPLETED, FactConsistencyStatus.FAILED], COMPLETED: [FactConsistencyStatus.APPROVED, FactConsistencyStatus.REJECTED], APPROVED: [], REJECTED: [], FAILED: [FactConsistencyStatus.PROCESSING] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid fact consistency status transition from ${current} to ${next}`); }
}

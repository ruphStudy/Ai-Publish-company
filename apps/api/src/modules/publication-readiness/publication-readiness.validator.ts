import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PublicationDecision, PublicationReadinessStatus } from './entities/publication-readiness.entity';

@Injectable()
export class PublicationReadinessValidator {
  validateTransition(current: PublicationReadinessStatus, next: PublicationReadinessStatus): void { const allowed: Record<PublicationReadinessStatus, PublicationReadinessStatus[]> = { PENDING: [PublicationReadinessStatus.PROCESSING, PublicationReadinessStatus.SUPERSEDED], PROCESSING: [PublicationReadinessStatus.COMPLETED, PublicationReadinessStatus.FAILED], COMPLETED: [PublicationReadinessStatus.APPROVED, PublicationReadinessStatus.REJECTED, PublicationReadinessStatus.SUPERSEDED], APPROVED: [PublicationReadinessStatus.REJECTED, PublicationReadinessStatus.SUPERSEDED], REJECTED: [PublicationReadinessStatus.SUPERSEDED], FAILED: [PublicationReadinessStatus.PROCESSING, PublicationReadinessStatus.SUPERSEDED], SUPERSEDED: [] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid publication readiness status transition from ${current} to ${next}`); }
  validateApproval(input: { finalDecision: PublicationDecision; blockers: string[]; missingRequirements: string[] }): void { if (input.finalDecision === PublicationDecision.BLOCKED || input.blockers.length > 0 || input.missingRequirements.length > 0) throw new ConflictException('Critical publication readiness blockers prevent approval'); }
  validateVersion(expected: string, actual?: string): void { if (actual && actual !== expected) throw new ConflictException('Source result manuscript version mismatch'); }
}

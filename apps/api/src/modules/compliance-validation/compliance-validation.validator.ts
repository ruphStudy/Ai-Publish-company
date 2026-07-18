import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { ComplianceValidationStatus } from './entities/compliance-validation.entity';

@Injectable()
export class ComplianceValidationValidator {
  validateTarget(projectId: string, target: { projectId: string; contentVersion: string; markdownContent: string }, requestedVersion: string): void { if (target.projectId !== projectId) throw new BadRequestException('Target does not belong to the project'); if (!target.markdownContent.trim()) throw new BadRequestException('Manuscript target is empty'); if (target.contentVersion !== requestedVersion) throw new ConflictException('Manuscript version mismatch'); }
  validateTransition(current: ComplianceValidationStatus, next: ComplianceValidationStatus): void { const allowed: Record<ComplianceValidationStatus, ComplianceValidationStatus[]> = { PENDING: [ComplianceValidationStatus.PROCESSING], PROCESSING: [ComplianceValidationStatus.COMPLETED, ComplianceValidationStatus.FAILED], COMPLETED: [ComplianceValidationStatus.APPROVED, ComplianceValidationStatus.REJECTED], APPROVED: [], REJECTED: [], FAILED: [ComplianceValidationStatus.PROCESSING] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid compliance validation status transition from ${current} to ${next}`); }
}

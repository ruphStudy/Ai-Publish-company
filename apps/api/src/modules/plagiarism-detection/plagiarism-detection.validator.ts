import { BadRequestException, Injectable } from '@nestjs/common';
import { PlagiarismDetectionStatus } from './entities/plagiarism-detection.entity';
@Injectable()
export class PlagiarismDetectionValidator {
  validateTarget(projectId: string, target: { projectId: string; contentVersion: string; markdownContent: string }, requestedVersion: string): void { if (target.projectId !== projectId) throw new BadRequestException('Target does not belong to the project'); if (!target.markdownContent.trim()) throw new BadRequestException('Manuscript target is empty'); if (target.contentVersion !== requestedVersion) throw new BadRequestException('Manuscript version mismatch'); }
  validateTransition(current: PlagiarismDetectionStatus, next: PlagiarismDetectionStatus): void { const allowed: Record<PlagiarismDetectionStatus, PlagiarismDetectionStatus[]> = { PENDING: [PlagiarismDetectionStatus.PROCESSING], PROCESSING: [PlagiarismDetectionStatus.COMPLETED, PlagiarismDetectionStatus.FAILED], COMPLETED: [PlagiarismDetectionStatus.APPROVED, PlagiarismDetectionStatus.REJECTED], APPROVED: [], REJECTED: [], FAILED: [PlagiarismDetectionStatus.PROCESSING] }; if (!allowed[current].includes(next)) throw new BadRequestException(`Invalid plagiarism detection status transition from ${current} to ${next}`); }
}

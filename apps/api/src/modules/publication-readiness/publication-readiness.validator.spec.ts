import { BadRequestException, ConflictException } from '@nestjs/common';
import { PublicationDecision, PublicationReadinessStatus } from './entities/publication-readiness.entity';
import { PublicationReadinessValidator } from './publication-readiness.validator';

describe('PublicationReadinessValidator', () => {
  const validator = new PublicationReadinessValidator();
  it('enforces status transitions', () => {
    expect(() => validator.validateTransition(PublicationReadinessStatus.COMPLETED, PublicationReadinessStatus.APPROVED)).not.toThrow();
    expect(() => validator.validateTransition(PublicationReadinessStatus.SUPERSEDED, PublicationReadinessStatus.APPROVED)).toThrow(BadRequestException);
  });
  it('blocks approval with critical blockers', () => {
    expect(() => validator.validateApproval({ finalDecision: PublicationDecision.READY, blockers: [], missingRequirements: [] })).not.toThrow();
    expect(() => validator.validateApproval({ finalDecision: PublicationDecision.BLOCKED, blockers: ['critical'], missingRequirements: [] })).toThrow(ConflictException);
  });
  it('rejects mismatched manuscript versions', () => {
    expect(() => validator.validateVersion('v1', 'v1')).not.toThrow();
    expect(() => validator.validateVersion('v1', 'v2')).toThrow(ConflictException);
  });
});

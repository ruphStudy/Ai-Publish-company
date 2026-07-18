import { BadRequestException, ConflictException } from '@nestjs/common';
import { PublishingTargetStatus, PublishingWorkflowStatus } from './entities/publishing-workflow.entity';
import { PublishingWorkflowValidator } from './publishing-workflow.validator';

describe('PublishingWorkflowValidator', () => {
  const validator = new PublishingWorkflowValidator();
  it('allows valid workflow transitions and rejects terminal mutation', () => {
    expect(() => validator.validateWorkflowTransition(PublishingWorkflowStatus.READY, PublishingWorkflowStatus.QUEUED)).not.toThrow();
    expect(() => validator.validateWorkflowTransition(PublishingWorkflowStatus.COMPLETED, PublishingWorkflowStatus.PROCESSING)).toThrow(BadRequestException);
  });
  it('rejects invalid target terminal transitions', () => {
    expect(() => validator.validateTargetTransition(PublishingTargetStatus.PENDING, PublishingTargetStatus.SUBMITTING)).not.toThrow();
    expect(() => validator.validateTargetTransition(PublishingTargetStatus.PUBLISHED, PublishingTargetStatus.FAILED)).toThrow(BadRequestException);
  });
  it('blocks publication when readiness is not approved', () => {
    expect(() => validator.validateReady({ readinessDecision: 'READY', readinessStatus: 'APPROVED', manualApprovalRequired: true, manualApprovalStatus: 'APPROVED', blockers: [] })).not.toThrow();
    expect(() => validator.validateReady({ readinessDecision: 'BLOCKED', readinessStatus: 'COMPLETED', manualApprovalRequired: true, manualApprovalStatus: 'REQUIRED', blockers: ['critical'] })).toThrow(ConflictException);
  });
});

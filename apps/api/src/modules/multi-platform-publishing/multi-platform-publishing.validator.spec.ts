import { BadRequestException } from '@nestjs/common';
import { MultiPlatformOrchestrationStatus } from './entities/multi-platform-publishing.entity';
import { MultiPlatformPublishingValidator } from './multi-platform-publishing.validator';

describe('MultiPlatformPublishingValidator', () => {
  const validator = new MultiPlatformPublishingValidator();

  it('allows supported orchestration transitions', () => {
    expect(() => validator.validateTransition(MultiPlatformOrchestrationStatus.READY, MultiPlatformOrchestrationStatus.QUEUED)).not.toThrow();
    expect(() => validator.validateTransition(MultiPlatformOrchestrationStatus.QUEUED, MultiPlatformOrchestrationStatus.PROCESSING)).not.toThrow();
  });

  it('rejects invalid terminal mutations', () => {
    expect(() => validator.validateTransition(MultiPlatformOrchestrationStatus.COMPLETED, MultiPlatformOrchestrationStatus.PROCESSING)).toThrow(BadRequestException);
    expect(() => validator.validateTransition(MultiPlatformOrchestrationStatus.CANCELLED, MultiPlatformOrchestrationStatus.QUEUED)).toThrow(BadRequestException);
  });
});

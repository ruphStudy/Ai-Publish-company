import { BadRequestException } from '@nestjs/common';
import { NormalizedPublicationStatus, PublicationStatusSource } from './entities/publication-status-sync.entity';
import { PublicationStatusTransitionValidator } from './publication-status-transition.validator';

describe('PublicationStatusTransitionValidator', () => {
  const validator = new PublicationStatusTransitionValidator();

  it('allows valid publication lifecycle transitions', () => {
    expect(() => validator.validate(NormalizedPublicationStatus.READY_FOR_SUBMISSION, NormalizedPublicationStatus.SUBMITTED, PublicationStatusSource.PROVIDER_API)).not.toThrow();
    expect(() => validator.validate(NormalizedPublicationStatus.IN_REVIEW, NormalizedPublicationStatus.APPROVED, PublicationStatusSource.PROVIDER_API)).not.toThrow();
    expect(() => validator.validate(NormalizedPublicationStatus.PUBLISHING, NormalizedPublicationStatus.LIVE, PublicationStatusSource.PROVIDER_API)).not.toThrow();
  });

  it('rejects invalid and protected terminal regressions', () => {
    expect(() => validator.validate(NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.IN_REVIEW, PublicationStatusSource.SCHEDULED_POLL)).toThrow(BadRequestException);
    expect(() => validator.validate(NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.PROCESSING, PublicationStatusSource.MANUAL_UPDATE)).toThrow(BadRequestException);
  });

  it('allows privileged corrections', () => {
    expect(() => validator.validate(NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.PROCESSING, PublicationStatusSource.ADMIN_CORRECTION)).not.toThrow();
  });
});

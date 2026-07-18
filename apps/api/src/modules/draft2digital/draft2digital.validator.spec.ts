import { BadRequestException } from '@nestjs/common';
import { Draft2DigitalIntegrationMode, Draft2DigitalStatus } from './entities/draft2digital.entity';
import { Draft2DigitalValidator } from './draft2digital.validator';

describe('Draft2DigitalValidator', () => {
  const validator = new Draft2DigitalValidator();
  it('validates required metadata', () => {
    const issues = validator.validateMetadata({ title: '', author: '', contributors: [], description: '', keywords: [], categories: [], language: '', pricing: { currency: 'USD', listPrice: 0, royaltyProfile: 'STANDARD', territoryProfile: 'WORLDWIDE', pricingVersion: 'v1' }, territories: [], aiDisclosure: {} });
    expect(issues).toContain('Draft2Digital title is required');
    expect(issues).toContain('Draft2Digital author is required');
    expect(issues).toContain('Draft2Digital pricing must be positive');
  });
  it('rejects API mode', () => {
    expect(() => validator.validateConfiguration(Draft2DigitalIntegrationMode.API)).toThrow(BadRequestException);
  });
  it('enforces manual status transitions', () => {
    expect(() => validator.validateStatusTransition(Draft2DigitalStatus.READY_FOR_SUBMISSION, Draft2DigitalStatus.SUBMISSION_RECORDED)).not.toThrow();
    expect(() => validator.validateStatusTransition(Draft2DigitalStatus.LIVE, Draft2DigitalStatus.IN_REVIEW)).toThrow(BadRequestException);
  });
});

import { BadRequestException, ConflictException } from '@nestjs/common';
import { ComplianceValidationStatus } from './entities/compliance-validation.entity';
import { ComplianceValidationValidator } from './compliance-validation.validator';

describe('ComplianceValidationValidator', () => {
  const validator = new ComplianceValidationValidator();
  it('rejects invalid manuscript targets', () => {
    expect(() => validator.validateTarget('a', { projectId: 'b', contentVersion: '1', markdownContent: 'content' }, '1')).toThrow(BadRequestException);
    expect(() => validator.validateTarget('a', { projectId: 'a', contentVersion: '1', markdownContent: '' }, '1')).toThrow(BadRequestException);
    expect(() => validator.validateTarget('a', { projectId: 'a', contentVersion: '1', markdownContent: 'content' }, '2')).toThrow(ConflictException);
  });
  it('enforces approval and rejection transitions', () => {
    expect(() => validator.validateTransition(ComplianceValidationStatus.COMPLETED, ComplianceValidationStatus.APPROVED)).not.toThrow();
    expect(() => validator.validateTransition(ComplianceValidationStatus.COMPLETED, ComplianceValidationStatus.REJECTED)).not.toThrow();
    expect(() => validator.validateTransition(ComplianceValidationStatus.PENDING, ComplianceValidationStatus.APPROVED)).toThrow(BadRequestException);
  });
});

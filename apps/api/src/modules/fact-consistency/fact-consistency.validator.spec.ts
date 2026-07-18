import { BadRequestException, ConflictException } from '@nestjs/common';
import { FactConsistencyStatus } from './entities/fact-consistency.entity';
import { FactConsistencyValidator } from './fact-consistency.validator';
describe('FactConsistencyValidator', () => {
  const validator = new FactConsistencyValidator();
  it('rejects version and project mismatches', () => { expect(() => validator.validateTarget('a', { projectId: 'a', contentVersion: '1', markdownContent: 'content' }, '2')).toThrow(ConflictException); expect(() => validator.validateTarget('a', { projectId: 'b', contentVersion: '1', markdownContent: 'content' }, '1')).toThrow(BadRequestException); });
  it('allows terminal review transitions only from completed', () => { expect(() => validator.validateTransition(FactConsistencyStatus.COMPLETED, FactConsistencyStatus.APPROVED)).not.toThrow(); expect(() => validator.validateTransition(FactConsistencyStatus.PENDING, FactConsistencyStatus.APPROVED)).toThrow(BadRequestException); });
});

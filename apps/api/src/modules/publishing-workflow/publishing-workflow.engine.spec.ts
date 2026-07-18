import { PublishingRetryStrategyType } from './entities/publishing-workflow.entity';
import { PublishingWorkflowEngine } from './publishing-workflow.engine';

describe('PublishingWorkflowEngine', () => {
  const engine = new PublishingWorkflowEngine();
  it('aggregates all-target completion', () => {
    expect(engine.aggregate(['SUBMITTED', 'PUBLISHED'])).toBe('COMPLETED');
  });
  it('aggregates partial completion', () => {
    expect(engine.aggregate(['SUBMITTED', 'FAILED'])).toBe('PARTIALLY_COMPLETED');
  });
  it('calculates exponential retry delay', () => {
    const now = Date.now();
    const retry = engine.nextRetryAt(3, 1000, PublishingRetryStrategyType.EXPONENTIAL);
    expect(retry?.getTime()).toBeGreaterThanOrEqual(now + 4000);
  });
  it('does not retry when strategy is none', () => {
    expect(engine.nextRetryAt(1, 1000, PublishingRetryStrategyType.NONE)).toBeNull();
  });
  it('redacts provider secrets', () => {
    expect(engine.sanitizeProviderResponse({ token: 'hidden', status: 'ok', apiKey: 'hidden' })).toEqual({ status: 'ok' });
  });
});

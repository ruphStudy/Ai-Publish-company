import { defaultPublishingWorkflowPolicy } from './config/publishing-workflow.config';
import { PublishingScope } from './entities/publishing-workflow.entity';
import { PublishingWorkflowFactory } from './publishing-workflow.factory';

describe('PublishingWorkflowFactory', () => {
  const factory = new PublishingWorkflowFactory();
  it('generates deterministic idempotency keys and fingerprints', () => {
    const input = { projectId: 'p', manuscriptVersion: '1', publicationScope: PublishingScope.EBOOK, targets: defaultPublishingWorkflowPolicy.enabledTargets, policyVersion: defaultPublishingWorkflowPolicy.policyVersion };
    const first = factory.fingerprint(input);
    const second = factory.fingerprint(input);
    expect(first).toBe(second);
    expect(factory.idempotencyKey({ projectId: 'p', manuscriptVersion: '1', publicationScope: PublishingScope.EBOOK, fingerprint: first })).toBe(factory.idempotencyKey({ projectId: 'p', manuscriptVersion: '1', publicationScope: PublishingScope.EBOOK, fingerprint: first }));
  });
});

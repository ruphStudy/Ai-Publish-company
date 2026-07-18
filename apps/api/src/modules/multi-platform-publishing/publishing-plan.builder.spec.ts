import { multiPlatformPublishingDefaultPolicy } from './config/multi-platform-publishing.config';
import { PublishingScope } from '../publishing-workflow/entities/publishing-workflow.entity';
import { MultiPlatformTargetStatus } from './entities/multi-platform-publishing.entity';
import { PublishingPlanBuilder } from './publishing-plan.builder';

describe('PublishingPlanBuilder', () => {
  const builder = new PublishingPlanBuilder();

  it('generates deterministic fingerprints and idempotency keys', () => {
    const providers = [
      { providerKey: 'DRAFT2DIGITAL', providerFormat: 'EPUB', required: false, priority: 2, dependencies: [], storefronts: ['APPLE'] },
      { providerKey: 'AMAZON_KDP', providerFormat: 'KINDLE_EBOOK', required: true, priority: 1, dependencies: [], storefronts: ['AMAZON'] },
    ];

    const first = builder.fingerprint({ projectId: 'p1', manuscriptVersion: 'v1', publicationScope: PublishingScope.EBOOK, providers, executionStrategy: multiPlatformPublishingDefaultPolicy.executionStrategy, policyVersion: multiPlatformPublishingDefaultPolicy.policyVersion });
    const second = builder.fingerprint({ projectId: 'p1', manuscriptVersion: 'v1', publicationScope: PublishingScope.EBOOK, providers: [...providers].reverse(), executionStrategy: multiPlatformPublishingDefaultPolicy.executionStrategy, policyVersion: multiPlatformPublishingDefaultPolicy.policyVersion });

    expect(first).toBe(second);
    expect(builder.idempotencyKey({ projectId: 'p1', manuscriptVersion: 'v1', publicationScope: PublishingScope.EBOOK, fingerprint: first })).toBe(builder.idempotencyKey({ projectId: 'p1', manuscriptVersion: 'v1', publicationScope: PublishingScope.EBOOK, fingerprint: first }));
  });

  it('creates ready provider targets without submission side effects', () => {
    const target = builder.target('o1', 'p1', { providerKey: 'AMAZON_KDP', providerFormat: 'KINDLE_EBOOK', required: true, priority: 1, dependencies: [], storefronts: ['AMAZON'] }, 2);

    expect(target.status).toBe(MultiPlatformTargetStatus.READY);
    expect(target.externalSubmissionId).toBeNull();
    expect(target.packageReference).toBeNull();
  });
});

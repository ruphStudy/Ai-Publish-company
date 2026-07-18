import { BadRequestException } from '@nestjs/common';
import type { ResolvedProviderTarget } from './interfaces/multi-platform-publishing.interface';
import { PublishingDependencyResolver } from './publishing-dependency.resolver';

describe('PublishingDependencyResolver', () => {
  const resolver = new PublishingDependencyResolver();

  it('builds execution nodes with dependency order metadata', () => {
    const targets: ResolvedProviderTarget[] = [
      { providerKey: 'AMAZON_KDP', providerFormat: 'KINDLE_EBOOK', required: true, priority: 1, dependencies: [], storefronts: ['AMAZON'] },
      { providerKey: 'DRAFT2DIGITAL', providerFormat: 'EPUB', required: false, priority: 2, dependencies: ['AMAZON_KDP'], storefronts: ['APPLE'] },
    ];

    expect(resolver.graph(targets)).toEqual({ AMAZON_KDP: [], DRAFT2DIGITAL: ['AMAZON_KDP'] });
    expect(resolver.nodes(targets)[1]).toMatchObject({ providerKey: 'DRAFT2DIGITAL', dependencies: ['AMAZON_KDP'], readinessState: 'READY', executionState: 'PENDING' });
  });

  it('rejects circular provider dependencies', () => {
    const targets: ResolvedProviderTarget[] = [
      { providerKey: 'A', providerFormat: 'EPUB', required: true, priority: 1, dependencies: ['B'], storefronts: [] },
      { providerKey: 'B', providerFormat: 'EPUB', required: true, priority: 2, dependencies: ['A'], storefronts: [] },
    ];

    expect(() => resolver.graph(targets)).toThrow(BadRequestException);
  });
});

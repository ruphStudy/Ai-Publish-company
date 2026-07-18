import { Injectable } from '@nestjs/common';
import { MultiPlatformConflictPolicy } from './entities/multi-platform-publishing.entity';
import type { DistributionConflict, ResolvedProviderTarget } from './interfaces/multi-platform-publishing.interface';

@Injectable()
export class PublishingConflictResolver {
  detect(targets: ResolvedProviderTarget[], metadata: Record<string, unknown>): DistributionConflict[] {
    const conflicts: DistributionConflict[] = [];
    const storefronts = new Map<string, string[]>();
    for (const target of targets) for (const store of target.storefronts) storefronts.set(store, [...(storefronts.get(store) ?? []), target.providerKey]);
    for (const [storefront, providers] of storefronts) if (providers.length > 1) conflicts.push({ conflictId: `STORE-${storefront}`, type: 'DUPLICATE_STOREFRONT', severity: 'WARNING', providerKeys: providers, message: `Multiple providers may distribute to ${storefront}` });
    if (metadata.isbn && targets.length > 1) conflicts.push({ conflictId: 'ISBN-DUPLICATE', type: 'DUPLICATE_ISBN_USAGE', severity: 'WARNING', providerKeys: targets.map((target) => target.providerKey), message: 'Same ISBN may be reused across multiple provider submissions' });
    return conflicts;
  }
  blocked(conflicts: DistributionConflict[], policy: MultiPlatformConflictPolicy): string[] { if (policy === MultiPlatformConflictPolicy.BLOCK) return conflicts.map((conflict) => conflict.message); return conflicts.filter((conflict) => conflict.severity === 'BLOCKING').map((conflict) => conflict.message); }
}

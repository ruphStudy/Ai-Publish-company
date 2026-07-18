import { BadRequestException, Injectable } from '@nestjs/common';
import { PublishingProviderFactory } from '../publishing-workflow/publishing-provider.factory';
import type { MultiPlatformPublishingPolicy } from './config/multi-platform-publishing.config';
import type { ResolvedProviderTarget } from './interfaces/multi-platform-publishing.interface';
import { PublishingScope } from '../publishing-workflow/entities/publishing-workflow.entity';

@Injectable()
export class PublishingTargetResolver {
  constructor(private readonly providers: PublishingProviderFactory) {}
  resolve(providerKeys: string[] | undefined, scope: PublishingScope, policy: MultiPlatformPublishingPolicy): ResolvedProviderTarget[] {
    const keys = providerKeys?.length ? providerKeys : policy.enabledProviders.filter((provider) => provider.enabled).map((provider) => provider.providerKey);
    if (new Set(keys).size !== keys.length) throw new BadRequestException('Duplicate provider targets are not allowed');
    return keys.flatMap((key) => {
      const config = policy.enabledProviders.find((provider) => provider.providerKey === key);
      if (!config) throw new BadRequestException(`Unknown publishing provider: ${key}`);
      if (!config.enabled) throw new BadRequestException(`Publishing provider is disabled: ${key}`);
      this.providers.resolve(key);
      const formats = config.supportedFormats[scope] ?? [];
      if (!formats.length) throw new BadRequestException(`Publishing provider ${key} does not support ${scope}`);
      return formats.map((providerFormat) => ({ providerKey: key, providerFormat, required: config.required || policy.requiredProviders.includes(key), priority: config.priority, dependencies: config.dependencies, storefronts: config.storefronts }));
    });
  }
}

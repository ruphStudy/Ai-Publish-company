import { Injectable, NotFoundException } from '@nestjs/common';
import { PlatformCapabilityRegistry } from '../../core/platform';
import { AmazonKdpPublishingProvider } from '../amazon-kdp/amazon-kdp-publishing.provider';
import { Draft2DigitalPublishingProvider } from '../draft2digital/draft2digital-publishing.provider';
import { GooglePlayBooksPublishingProvider } from '../google-play-books/google-play-books-publishing.provider';
import type { PublishingProvider } from './interfaces/publishing-provider.interface';
import { MockPublishingProvider } from './providers/mock-publishing.provider';

@Injectable()
export class PublishingProviderFactory {
  private readonly providers: Map<string, PublishingProvider>;

  constructor(
    private readonly platform: PlatformCapabilityRegistry,
    mock: MockPublishingProvider,
    amazonKdp: AmazonKdpPublishingProvider,
    draft2Digital: Draft2DigitalPublishingProvider,
    googlePlayBooks: GooglePlayBooksPublishingProvider,
  ) {
    this.providers = new Map([mock, amazonKdp, draft2Digital, googlePlayBooks].map((provider) => [provider.getCapabilities().providerKey, provider]));
  }

  resolve(providerKey: string): PublishingProvider {
    const provider = this.providers.get(providerKey);
    if (!provider) throw new NotFoundException(`Publishing provider "${providerKey}" is not configured`);
    return provider;
  }

  configuredProviders(): string[] { return [...this.providers.keys()]; }
  providerMetadata(providerKey: string) { return this.platform.provider(providerKey) ?? null; }
  providerCapabilities(providerKey: string) { return this.resolve(providerKey).getCapabilities(); }
}

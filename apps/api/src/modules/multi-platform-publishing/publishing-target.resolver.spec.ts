import { BadRequestException } from '@nestjs/common';
import { PublishingScope } from '../publishing-workflow/entities/publishing-workflow.entity';
import { multiPlatformPublishingDefaultPolicy } from './config/multi-platform-publishing.config';
import { PublishingTargetResolver } from './publishing-target.resolver';

describe('PublishingTargetResolver', () => {
  const providerFactory = { resolve: jest.fn((key: string) => ({ providerKey: key })) };
  const resolver = new PublishingTargetResolver(providerFactory as never);

  beforeEach(() => providerFactory.resolve.mockClear());

  it('resolves enabled providers and supported formats', () => {
    const targets = resolver.resolve(['AMAZON_KDP', 'GOOGLE_PLAY_BOOKS'], PublishingScope.EBOOK, multiPlatformPublishingDefaultPolicy);

    expect(targets.map((target) => `${target.providerKey}:${target.providerFormat}`)).toEqual(['AMAZON_KDP:KINDLE_EBOOK', 'GOOGLE_PLAY_BOOKS:EPUB', 'GOOGLE_PLAY_BOOKS:PDF_EBOOK']);
    expect(providerFactory.resolve).toHaveBeenCalledWith('AMAZON_KDP');
    expect(providerFactory.resolve).toHaveBeenCalledWith('GOOGLE_PLAY_BOOKS');
  });

  it('rejects duplicate and unsupported targets', () => {
    expect(() => resolver.resolve(['AMAZON_KDP', 'AMAZON_KDP'], PublishingScope.EBOOK, multiPlatformPublishingDefaultPolicy)).toThrow(BadRequestException);
    expect(() => resolver.resolve(['UNKNOWN'], PublishingScope.EBOOK, multiPlatformPublishingDefaultPolicy)).toThrow(BadRequestException);
    expect(() => resolver.resolve(['GOOGLE_PLAY_BOOKS'], PublishingScope.PRINT, multiPlatformPublishingDefaultPolicy)).toThrow(BadRequestException);
  });
});

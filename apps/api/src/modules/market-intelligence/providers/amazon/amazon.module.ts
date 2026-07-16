import { Module } from '@nestjs/common';

import { AmazonMarketplaceProvider } from './amazon.provider';
import { AmazonProviderAdapter } from './adapters/amazon.adapter';
import { AmazonMockProviderAdapter } from './adapters/amazon-mock.adapter';
import { AmazonResponseMapper } from './mappers/amazon-response.mapper';
import { AmazonProviderValidator } from './validators/amazon.validator';
import { AMAZON_CONFIG_TOKEN, AMAZON_ADAPTER_TOKEN } from './constants/amazon.constants';
import { loadAmazonProviderConfig, AmazonProviderConfig } from './config/amazon-provider.config';

@Module({
  providers: [
    {
      provide: AMAZON_CONFIG_TOKEN,
      useFactory: loadAmazonProviderConfig,
    },
    {
      provide: AMAZON_ADAPTER_TOKEN,
      useFactory: (config: AmazonProviderConfig) =>
        config.useMock ? new AmazonMockProviderAdapter() : new AmazonProviderAdapter(),
      inject: [AMAZON_CONFIG_TOKEN],
    },
    AmazonResponseMapper,
    AmazonProviderValidator,
    AmazonMarketplaceProvider,
  ],
  exports: [AmazonMarketplaceProvider],
})
export class AmazonProviderModule {}

import { Module } from '@nestjs/common';

import { GoogleTrendsProvider } from './google-trends.provider';
import { GoogleTrendsProviderAdapter } from './adapters/google-trends.adapter';
import { GoogleTrendsMockProviderAdapter } from './adapters/google-trends-mock.adapter';
import { GoogleTrendsResponseMapper } from './mappers/google-trends-response.mapper';
import { GoogleTrendsValidator } from './validators/google-trends.validator';
import {
  GOOGLE_TRENDS_CONFIG_TOKEN,
  GOOGLE_TRENDS_ADAPTER_TOKEN,
} from './constants/google-trends.constants';
import {
  loadGoogleTrendsProviderConfig,
  GoogleTrendsProviderConfig,
} from './config/google-trends-provider.config';

@Module({
  providers: [
    {
      provide: GOOGLE_TRENDS_CONFIG_TOKEN,
      useFactory: loadGoogleTrendsProviderConfig,
    },
    {
      provide: GOOGLE_TRENDS_ADAPTER_TOKEN,
      useFactory: (config: GoogleTrendsProviderConfig) =>
        config.useMock
          ? new GoogleTrendsMockProviderAdapter()
          : new GoogleTrendsProviderAdapter(),
      inject: [GOOGLE_TRENDS_CONFIG_TOKEN],
    },
    GoogleTrendsResponseMapper,
    GoogleTrendsValidator,
    GoogleTrendsProvider,
  ],
  exports: [GoogleTrendsProvider],
})
export class GoogleTrendsProviderModule {}

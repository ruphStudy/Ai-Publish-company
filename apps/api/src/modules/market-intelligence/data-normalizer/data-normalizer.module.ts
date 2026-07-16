import { Module } from '@nestjs/common';

import {
  DATA_NORMALIZER_CONFIG_TOKEN,
  loadDataNormalizerConfig,
} from './config/data-normalizer.config';
import { DataNormalizerService } from './data-normalizer.service';
import { DuplicateDetectionService } from './duplicate/duplicate-detection.service';
import {
  PROVIDER_NORMALIZATION_STRATEGIES_TOKEN,
} from './interfaces/provider-normalization-strategy.interface';
import { NormalizationFactory } from './normalization.factory';
import { AmazonNormalizationStrategy } from './strategies/amazon-normalization.strategy';
import { GoogleTrendsNormalizationStrategy } from './strategies/google-trends-normalization.strategy';
import { DataQualityValidator } from './validation/data-quality.validator';
import { UnifiedMarketIntelligenceValidator } from './validation/unified-market-intelligence.validator';

@Module({
  providers: [
    {
      provide: DATA_NORMALIZER_CONFIG_TOKEN,
      useFactory: loadDataNormalizerConfig,
    },
    AmazonNormalizationStrategy,
    GoogleTrendsNormalizationStrategy,
    {
      provide: PROVIDER_NORMALIZATION_STRATEGIES_TOKEN,
      useFactory: (
        amazonStrategy: AmazonNormalizationStrategy,
        googleTrendsStrategy: GoogleTrendsNormalizationStrategy,
      ) => [amazonStrategy, googleTrendsStrategy],
      inject: [AmazonNormalizationStrategy, GoogleTrendsNormalizationStrategy],
    },
    NormalizationFactory,
    DataQualityValidator,
    UnifiedMarketIntelligenceValidator,
    DuplicateDetectionService,
    DataNormalizerService,
  ],
  exports: [
    DataNormalizerService,
    NormalizationFactory,
    UnifiedMarketIntelligenceValidator,
    DataQualityValidator,
  ],
})
export class DataNormalizerModule {}
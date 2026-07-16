import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { AppLoggerService } from '../../../core/logger/logger.service';
import { ProviderResponse } from '../providers/interfaces/provider.interface';
import { NormalizationFactory } from './normalization.factory';
import { DuplicateDetectionService } from './duplicate/duplicate-detection.service';
import {
  NormalizationRejectedRecord,
  NormalizationResult,
  UnifiedMarketIntelligenceModel,
} from './models/unified-market-intelligence.model';
import { DataQualityValidator } from './validation/data-quality.validator';
import { UnifiedMarketIntelligenceValidator } from './validation/unified-market-intelligence.validator';

@Injectable()
export class DataNormalizerService {
  constructor(
    private readonly normalizationFactory: NormalizationFactory,
    private readonly dataQualityValidator: DataQualityValidator,
    private readonly unifiedValidator: UnifiedMarketIntelligenceValidator,
    private readonly duplicateDetectionService: DuplicateDetectionService,
    private readonly logger: AppLoggerService,
  ) {}

  async normalize(response: ProviderResponse<unknown>): Promise<NormalizationResult> {
    if (!response.success) {
      throw new BadRequestException(
        `Cannot normalize unsuccessful provider response from "${response.provider}"`,
      );
    }

    if (!response.data) {
      throw new BadRequestException(
        `Provider response from "${response.provider}" does not contain data`,
      );
    }

    try {
      const strategy = this.normalizationFactory.resolve(response.provider);
      const sourceRecords = await strategy.normalize(response);
      const rejectedRecords: NormalizationRejectedRecord[] = [];
      const validRecords: UnifiedMarketIntelligenceModel[] = [];

      sourceRecords.forEach((record, index) => {
        const normalizedRecord = this.dataQualityValidator.normalize(record);
        const validation = this.unifiedValidator.validate(normalizedRecord);

        if (!validation.valid) {
          rejectedRecords.push({
            index,
            reasons: validation.errors,
          });
          return;
        }

        validRecords.push(normalizedRecord);
      });

      const deduplicated = this.duplicateDetectionService.removeDuplicates(validRecords);

      this.logger.log({
        message: 'Market intelligence data normalized',
        provider: response.provider,
        providerKey: response.key,
        receivedCount: sourceRecords.length,
        acceptedCount: deduplicated.records.length,
        rejectedCount: rejectedRecords.length,
        duplicateCount: deduplicated.duplicateCount,
      });

      return {
        records: deduplicated.records,
        receivedCount: sourceRecords.length,
        rejectedCount: rejectedRecords.length,
        duplicateCount: deduplicated.duplicateCount,
        rejectedRecords,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        {
          message: 'Market intelligence normalization failed',
          provider: response.provider,
          providerKey: response.key,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        error instanceof Error ? error.stack : undefined,
        DataNormalizerService.name,
      );

      throw new InternalServerErrorException(
        `Unable to normalize provider response from "${response.provider}"`,
      );
    }
  }
}
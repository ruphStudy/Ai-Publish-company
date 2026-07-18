import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoyaltyRecord, RoyaltyRecordSchema } from '../royalty-ingestion/entities/royalty-ingestion.entity';
import { SalesRecord, SalesRecordSchema } from '../sales-ingestion/entities/sales-ingestion.entity';
import { BookEditionResolutionService } from './book-edition-resolution.service';
import { CanonicalDimensionResolver } from './canonical-dimension.resolver';
import { CanonicalRoyaltyRepository } from './canonical-royalty.repository';
import { CanonicalRoyalty, CanonicalRoyaltySchema } from './entities/canonical-royalty.entity';
import { CanonicalSalesRepository } from './canonical-sales.repository';
import { CanonicalSales, CanonicalSalesSchema } from './entities/canonical-sales.entity';
import { CountryNormalizationService } from './country-normalization.service';
import { CurrencyNormalizationService } from './currency-normalization.service';
import { FinancialValueNormalizer } from './financial-value.normalizer';
import { FormatNormalizationService } from './format-normalization.service';
import { LanguageNormalizationService } from './language-normalization.service';
import { MarketplaceNormalizationService } from './marketplace-normalization.service';
import { NormalizationBatch, NormalizationBatchSchema, NormalizationResult, NormalizationResultSchema } from './entities/sales-royalty-normalization.entity';
import { NormalizationConflictResolver } from './normalization-conflict.resolver';
import { NormalizationCoordinator } from './normalization.coordinator';
import { NormalizationEventPublisher } from './normalization-event.publisher';
import { NormalizationBatchRepository, NormalizationResultRepository } from './normalization.repository';
import { NormalizationStrategyFactory } from './normalization-strategy.factory';
import { NormalizationValidator } from './normalization-validator';
import { ProviderMappingResolver } from './provider-mapping.resolver';
import { SalesRoyaltyNormalizationController } from './sales-royalty-normalization.controller';
import { SalesRoyaltyNormalizationEngine } from './sales-royalty-normalization.engine';
import { SalesRoyaltyNormalizationService } from './sales-royalty-normalization.service';
import { TimezoneNormalizationService } from './timezone-normalization.service';

@Module({ imports: [MongooseModule.forFeature([{ name: NormalizationBatch.name, schema: NormalizationBatchSchema }, { name: NormalizationResult.name, schema: NormalizationResultSchema }, { name: CanonicalSales.name, schema: CanonicalSalesSchema }, { name: CanonicalRoyalty.name, schema: CanonicalRoyaltySchema }, { name: SalesRecord.name, schema: SalesRecordSchema }, { name: RoyaltyRecord.name, schema: RoyaltyRecordSchema }])], controllers: [SalesRoyaltyNormalizationController], providers: [SalesRoyaltyNormalizationService, SalesRoyaltyNormalizationEngine, NormalizationCoordinator, NormalizationBatchRepository, NormalizationResultRepository, CanonicalSalesRepository, CanonicalRoyaltyRepository, ProviderMappingResolver, CanonicalDimensionResolver, CurrencyNormalizationService, TimezoneNormalizationService, MarketplaceNormalizationService, CountryNormalizationService, LanguageNormalizationService, FormatNormalizationService, BookEditionResolutionService, FinancialValueNormalizer, NormalizationValidator, NormalizationConflictResolver, NormalizationStrategyFactory, NormalizationEventPublisher], exports: [SalesRoyaltyNormalizationService, SalesRoyaltyNormalizationEngine, NormalizationBatchRepository, NormalizationResultRepository, CanonicalSalesRepository, CanonicalRoyaltyRepository] })
export class SalesRoyaltyNormalizationModule {}

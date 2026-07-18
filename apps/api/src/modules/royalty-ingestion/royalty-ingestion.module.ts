import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoyaltyImportJob, RoyaltyImportJobSchema, RoyaltyRecord, RoyaltyRecordSchema } from './entities/royalty-ingestion.entity';
import { RoyaltyImportCoordinator } from './royalty-import.coordinator';
import { RoyaltyImportNormalizer } from './royalty-import.normalizer';
import { RoyaltyImportRepository } from './royalty-import.repository';
import { RoyaltyImportValidator } from './royalty-import.validator';
import { RoyaltyIngestionController } from './royalty-ingestion.controller';
import { RoyaltyIngestionEngine } from './royalty-ingestion.engine';
import { RoyaltyIngestionEventPublisher } from './royalty-ingestion-event.publisher';
import { RoyaltyIngestionService } from './royalty-ingestion.service';
import { RoyaltyProviderResolver } from './royalty-provider.resolver';
import { RoyaltySyncCoordinator } from './royalty-sync.coordinator';

@Module({ imports: [MongooseModule.forFeature([{ name: RoyaltyRecord.name, schema: RoyaltyRecordSchema }, { name: RoyaltyImportJob.name, schema: RoyaltyImportJobSchema }])], controllers: [RoyaltyIngestionController], providers: [RoyaltyIngestionService, RoyaltyIngestionEngine, RoyaltyImportCoordinator, RoyaltySyncCoordinator, RoyaltyProviderResolver, RoyaltyImportValidator, RoyaltyImportNormalizer, RoyaltyImportRepository, RoyaltyIngestionEventPublisher], exports: [RoyaltyIngestionService, RoyaltyIngestionEngine, RoyaltyImportRepository] })
export class RoyaltyIngestionModule {}

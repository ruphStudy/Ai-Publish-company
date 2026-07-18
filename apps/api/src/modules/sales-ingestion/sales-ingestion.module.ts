import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesImportJob, SalesImportJobSchema, SalesRecord, SalesRecordSchema } from './entities/sales-ingestion.entity';
import { SalesImportCoordinator } from './sales-import.coordinator';
import { SalesImportNormalizer } from './sales-import.normalizer';
import { SalesImportRepository } from './sales-import.repository';
import { SalesImportValidator } from './sales-import.validator';
import { SalesIngestionController } from './sales-ingestion.controller';
import { SalesIngestionEngine } from './sales-ingestion.engine';
import { SalesIngestionEventPublisher } from './sales-ingestion-event.publisher';
import { SalesIngestionService } from './sales-ingestion.service';
import { SalesProviderResolver } from './sales-provider.resolver';
import { SalesSyncCoordinator } from './sales-sync.coordinator';

@Module({ imports: [MongooseModule.forFeature([{ name: SalesRecord.name, schema: SalesRecordSchema }, { name: SalesImportJob.name, schema: SalesImportJobSchema }])], controllers: [SalesIngestionController], providers: [SalesIngestionService, SalesIngestionEngine, SalesImportCoordinator, SalesSyncCoordinator, SalesProviderResolver, SalesImportValidator, SalesImportNormalizer, SalesImportRepository, SalesIngestionEventPublisher], exports: [SalesIngestionService, SalesIngestionEngine, SalesImportRepository] })
export class SalesIngestionModule {}

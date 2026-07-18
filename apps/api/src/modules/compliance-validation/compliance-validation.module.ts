import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { TableOfContentsModule } from '../table-of-contents/table-of-contents.module';
import { ComplianceValidationController } from './compliance-validation.controller';
import { ComplianceValidationEngine } from './compliance-validation.engine';
import { ComplianceValidationFactory } from './compliance-validation.factory';
import { ComplianceValidationMapper } from './compliance-validation.mapper';
import { ComplianceValidationRepository } from './compliance-validation.repository';
import { ComplianceValidationService } from './compliance-validation.service';
import { ComplianceValidationValidator } from './compliance-validation.validator';
import { ComplianceValidation, ComplianceValidationSchema } from './entities/compliance-validation.entity';
import { CitationComplianceStrategy } from './strategies/citation-compliance.strategy';
import { ExportComplianceStrategy } from './strategies/export-compliance.strategy';
import { MetadataComplianceStrategy } from './strategies/metadata-compliance.strategy';
import { StructureComplianceStrategy } from './strategies/structure-compliance.strategy';

@Module({ imports: [MongooseModule.forFeature([{ name: ComplianceValidation.name, schema: ComplianceValidationSchema }]), BookProjectModule, AIWritingModule, BookMetadataModule, TableOfContentsModule], controllers: [ComplianceValidationController], providers: [ComplianceValidationService, ComplianceValidationRepository, ComplianceValidationEngine, ComplianceValidationFactory, ComplianceValidationValidator, ComplianceValidationMapper, StructureComplianceStrategy, MetadataComplianceStrategy, ExportComplianceStrategy, CitationComplianceStrategy], exports: [ComplianceValidationService, ComplianceValidationRepository] })
export class ComplianceValidationModule {}

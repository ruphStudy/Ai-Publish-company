import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { ComplianceValidationModule } from '../compliance-validation/compliance-validation.module';
import { ContentImprovementModule } from '../content-improvement/content-improvement.module';
import { FactConsistencyModule } from '../fact-consistency/fact-consistency.module';
import { PlagiarismDetectionModule } from '../plagiarism-detection/plagiarism-detection.module';
import { QualityReviewModule } from '../quality-review/quality-review.module';
import { TableOfContentsModule } from '../table-of-contents/table-of-contents.module';
import { PublicationReadiness, PublicationReadinessSchema } from './entities/publication-readiness.entity';
import { PublicationReadinessController } from './publication-readiness.controller';
import { PublicationReadinessEngine } from './publication-readiness.engine';
import { PublicationReadinessFactory } from './publication-readiness.factory';
import { PublicationReadinessMapper } from './publication-readiness.mapper';
import { PublicationReadinessRepository } from './publication-readiness.repository';
import { PublicationReadinessService } from './publication-readiness.service';
import { PublicationReadinessValidator } from './publication-readiness.validator';

@Module({ imports: [MongooseModule.forFeature([{ name: PublicationReadiness.name, schema: PublicationReadinessSchema }]), BookProjectModule, AIWritingModule, QualityReviewModule, ContentImprovementModule, PlagiarismDetectionModule, FactConsistencyModule, ComplianceValidationModule, BookMetadataModule, TableOfContentsModule], controllers: [PublicationReadinessController], providers: [PublicationReadinessService, PublicationReadinessRepository, PublicationReadinessEngine, PublicationReadinessFactory, PublicationReadinessValidator, PublicationReadinessMapper], exports: [PublicationReadinessService, PublicationReadinessRepository] })
export class PublicationReadinessModule {}

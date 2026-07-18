import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { QualityReviewModule } from '../quality-review/quality-review.module';
import { ContentImprovementController } from './content-improvement.controller';
import { ContentImprovementEngine } from './content-improvement.engine';
import { ContentImprovementMapper } from './content-improvement.mapper';
import { ContentImprovementRepository } from './content-improvement.repository';
import { ContentImprovementService } from './content-improvement.service';
import { ContentImprovementValidator } from './content-improvement.validator';
import { ContentImprovement, ContentImprovementSchema } from './entities/content-improvement.entity';

@Module({ imports: [MongooseModule.forFeature([{ name: ContentImprovement.name, schema: ContentImprovementSchema }]), BookProjectModule, QualityReviewModule, AIWritingModule], controllers: [ContentImprovementController], providers: [ContentImprovementService, ContentImprovementRepository, ContentImprovementEngine, ContentImprovementValidator, ContentImprovementMapper], exports: [ContentImprovementService, ContentImprovementRepository] })
export class ContentImprovementModule {}

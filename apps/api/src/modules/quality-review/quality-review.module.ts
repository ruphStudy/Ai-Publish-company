import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { QualityReview, QualityReviewSchema } from './entities/quality-review.entity';
import { QualityReviewController } from './quality-review.controller';
import { QualityReviewEngine } from './quality-review.engine';
import { QualityReviewFactory } from './quality-review.factory';
import { QualityReviewMapper } from './quality-review.mapper';
import { QualityReviewRepository } from './quality-review.repository';
import { QualityReviewService } from './quality-review.service';
import { QualityReviewValidator } from './quality-review.validator';
import { ContentQualityStrategy } from './strategies/content-quality.strategy';
import { LanguageQualityStrategy } from './strategies/language-quality.strategy';
import { StructuralQualityStrategy } from './strategies/structural-quality.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QualityReview.name, schema: QualityReviewSchema }]),
    BookProjectModule,
    BookBlueprintModule,
    AIWritingModule,
  ],
  controllers: [QualityReviewController],
  providers: [
    QualityReviewService,
    QualityReviewRepository,
    QualityReviewEngine,
    QualityReviewFactory,
    QualityReviewValidator,
    QualityReviewMapper,
    LanguageQualityStrategy,
    ContentQualityStrategy,
    StructuralQualityStrategy,
  ],
  exports: [QualityReviewService, QualityReviewRepository],
})
export class QualityReviewModule {}

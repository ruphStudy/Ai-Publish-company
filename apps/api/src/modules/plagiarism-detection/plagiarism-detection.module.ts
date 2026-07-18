import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { PlagiarismDetection, PlagiarismDetectionSchema } from './entities/plagiarism-detection.entity';
import { PlagiarismDetectionController } from './plagiarism-detection.controller';
import { PlagiarismDetectionEngine } from './plagiarism-detection.engine';
import { PlagiarismDetectionFactory } from './plagiarism-detection.factory';
import { PlagiarismDetectionMapper } from './plagiarism-detection.mapper';
import { PlagiarismDetectionRepository } from './plagiarism-detection.repository';
import { PlagiarismDetectionService } from './plagiarism-detection.service';
import { PlagiarismDetectionValidator } from './plagiarism-detection.validator';
import { AiRepetitionStrategy } from './strategies/ai-repetition.strategy';
import { CopyrightRiskStrategy } from './strategies/copyright-risk.strategy';
import { DuplicateDetectionStrategy } from './strategies/duplicate-detection.strategy';
@Module({ imports: [MongooseModule.forFeature([{ name: PlagiarismDetection.name, schema: PlagiarismDetectionSchema }]), BookProjectModule, AIWritingModule], controllers: [PlagiarismDetectionController], providers: [PlagiarismDetectionService, PlagiarismDetectionRepository, PlagiarismDetectionEngine, PlagiarismDetectionFactory, PlagiarismDetectionValidator, PlagiarismDetectionMapper, DuplicateDetectionStrategy, AiRepetitionStrategy, CopyrightRiskStrategy], exports: [PlagiarismDetectionService, PlagiarismDetectionRepository] })
export class PlagiarismDetectionModule {}

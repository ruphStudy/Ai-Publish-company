import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { FactConsistency, FactConsistencySchema } from './entities/fact-consistency.entity';
import { FactConsistencyController } from './fact-consistency.controller';
import { FactConsistencyEngine } from './fact-consistency.engine';
import { FactConsistencyFactory } from './fact-consistency.factory';
import { FactConsistencyMapper } from './fact-consistency.mapper';
import { FactConsistencyRepository } from './fact-consistency.repository';
import { FactConsistencyService } from './fact-consistency.service';
import { FactConsistencyValidator } from './fact-consistency.validator';
import { ClaimExtractionStrategy } from './strategies/claim-extraction.strategy';
import { DeterministicConsistencyStrategy } from './strategies/deterministic-consistency.strategy';
import { SupportConsistencyStrategy } from './strategies/support-consistency.strategy';
@Module({ imports: [MongooseModule.forFeature([{ name: FactConsistency.name, schema: FactConsistencySchema }]), BookProjectModule, AIWritingModule], controllers: [FactConsistencyController], providers: [FactConsistencyService, FactConsistencyRepository, FactConsistencyEngine, FactConsistencyFactory, FactConsistencyValidator, FactConsistencyMapper, ClaimExtractionStrategy, DeterministicConsistencyStrategy, SupportConsistencyStrategy], exports: [FactConsistencyService, FactConsistencyRepository] })
export class FactConsistencyModule {}

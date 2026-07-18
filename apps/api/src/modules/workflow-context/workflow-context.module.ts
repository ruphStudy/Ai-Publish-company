import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookBlueprint, BookBlueprintSchema } from '../book-blueprint/entities/book-blueprint.entity';
import { BookMetadata, BookMetadataSchema } from '../book-metadata/entities/book-metadata.entity';
import { BookProject, BookProjectSchema } from '../book-project/entities/book-project.entity';
import { CoverPrompt, CoverPromptSchema } from '../cover-prompt/entities/cover-prompt.entity';
import { ExportJob, ExportJobSchema } from '../export/entities/export-job.entity';
import { MarketIntelligence, MarketIntelligenceSchema } from '../market-intelligence/entities/market-intelligence.entity';
import { MarketKnowledge, MarketKnowledgeSchema } from '../market-intelligence/knowledge-database/entities/market-knowledge.entity';
import { Outline, OutlineSchema } from '../outline/entities/outline.entity';
import { TableOfContents, TableOfContentsSchema } from '../table-of-contents/entities/table-of-contents.entity';
import { WorkflowContextController } from './workflow-context.controller';
import { WorkflowContextService } from './workflow-context.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: BookProject.name, schema: BookProjectSchema },
    { name: MarketIntelligence.name, schema: MarketIntelligenceSchema },
    { name: MarketKnowledge.name, schema: MarketKnowledgeSchema },
    { name: BookBlueprint.name, schema: BookBlueprintSchema },
    { name: Outline.name, schema: OutlineSchema },
    { name: BookMetadata.name, schema: BookMetadataSchema },
    { name: TableOfContents.name, schema: TableOfContentsSchema },
    { name: CoverPrompt.name, schema: CoverPromptSchema },
    { name: ExportJob.name, schema: ExportJobSchema },
  ])],
  controllers: [WorkflowContextController],
  providers: [WorkflowContextService],
})
export class WorkflowContextModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../category/entities/category.entity';
import { BookProject, BookProjectSchema } from '../book-project/entities/book-project.entity';
import { JobExecution, JobExecutionSchema } from '../background-jobs/entities/background-job.entity';
import { AIInsight, AIInsightSchema } from '../ai-insights/entities/ai-insight.entity';
import { Opportunity, OpportunitySchema } from '../opportunity-analytics/entities/opportunity-analytics.entity';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { DashboardSummaryController } from './dashboard-summary.controller';
import { DashboardSummaryService } from './dashboard-summary.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }, { name: BookProject.name, schema: BookProjectSchema }, { name: JobExecution.name, schema: JobExecutionSchema }, { name: AIInsight.name, schema: AIInsightSchema }, { name: Opportunity.name, schema: OpportunitySchema }])],
  controllers: [DashboardSummaryController],
  providers: [DashboardSummaryService, DashboardAnalyticsService],
})
export class DashboardModule {}

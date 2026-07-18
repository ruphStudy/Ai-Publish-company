import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { GlobalConfigModule } from './core/config/global-config.module';
import { GlobalLoggerModule } from './core/logger/global-logger.module';
import { GlobalAiModule } from './core/ai/global-ai.module';
import { PlatformModule } from './core/platform/platform.module';
import { PerformanceModule } from './core/performance/performance.module';
import { PublishingWorkflowModule } from './core/application/workflows/publishing-workflow.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ExampleModule } from './modules/example/example.module';
import { CategoryModule } from './modules/category/category.module';
import { BookModule } from './modules/book/book.module';
import { BookProjectModule } from './modules/book-project/book-project.module';
import { BookBlueprintModule } from './modules/book-blueprint/book-blueprint.module';
import { MarketIntelligenceModule } from './modules/market-intelligence/market-intelligence.module';
import { AuditModule } from './modules/audit/audit.module';
import { CacheInfrastructureModule } from './infrastructure/cache/cache.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { QueueInfrastructureModule } from './infrastructure/queue/queue.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { OutlineModule } from './modules/outline/outline.module';
import { ChapterGeneratorModule } from './modules/chapter-generator/chapter-generator.module';
import { AIWritingModule } from './modules/ai-writing/ai-writing.module';
import { BookMetadataModule } from './modules/book-metadata/book-metadata.module';
import { CoverPromptModule } from './modules/cover-prompt/cover-prompt.module';
import { TableOfContentsModule } from './modules/table-of-contents/table-of-contents.module';
import { ExportModule } from './modules/export/export.module';
import { QualityReviewModule } from './modules/quality-review/quality-review.module';
import { ContentImprovementModule } from './modules/content-improvement/content-improvement.module';
import { PlagiarismDetectionModule } from './modules/plagiarism-detection/plagiarism-detection.module';
import { FactConsistencyModule } from './modules/fact-consistency/fact-consistency.module';
import { ComplianceValidationModule } from './modules/compliance-validation/compliance-validation.module';
import { PublicationReadinessModule } from './modules/publication-readiness/publication-readiness.module';
import { PublishingWorkflowModule as PublishingWorkflowFeatureModule } from './modules/publishing-workflow/publishing-workflow.module';
import { AmazonKdpModule } from './modules/amazon-kdp/amazon-kdp.module';
import { Draft2DigitalModule } from './modules/draft2digital/draft2digital.module';
import { GooglePlayBooksModule } from './modules/google-play-books/google-play-books.module';
import { MultiPlatformPublishingModule } from './modules/multi-platform-publishing/multi-platform-publishing.module';
import { PublicationStatusSyncModule } from './modules/publication-status-sync/publication-status-sync.module';
import { PublishingHistoryModule } from './modules/publishing-history/publishing-history.module';
import { SalesIngestionModule } from './modules/sales-ingestion/sales-ingestion.module';
import { RoyaltyIngestionModule } from './modules/royalty-ingestion/royalty-ingestion.module';
import { SalesRoyaltyNormalizationModule } from './modules/sales-royalty-normalization/sales-royalty-normalization.module';
import { BookAnalyticsModule } from './modules/book-analytics/book-analytics.module';
import { OpportunityAnalyticsModule } from './modules/opportunity-analytics/opportunity-analytics.module';
import { AIInsightsModule } from './modules/ai-insights/ai-insights.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SettingsModule } from './modules/settings/settings.module';
import { BackgroundJobModule } from './modules/background-jobs/background-job.module';
import { ResilienceModule } from './modules/resilience/resilience.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WorkflowContextModule } from './modules/workflow-context/workflow-context.module';

@Module({
  imports: [
    GlobalConfigModule,
    GlobalLoggerModule,
    GlobalAiModule,
    PlatformModule,
    PerformanceModule,
    PublishingWorkflowModule,
    DatabaseModule,
    CacheInfrastructureModule,
    QueueInfrastructureModule,
    StorageModule,
    AuthModule,
    CategoryModule,
    BookModule,
    BookProjectModule,
    BookBlueprintModule,
    MarketIntelligenceModule,
    AuditModule,
    HealthModule,
    ExampleModule,
    OutlineModule,
    ChapterGeneratorModule,
    AIWritingModule,
    BookMetadataModule,
    CoverPromptModule,
    TableOfContentsModule,
    ExportModule,
    QualityReviewModule,
    ContentImprovementModule,
    PlagiarismDetectionModule,
    FactConsistencyModule,
    ComplianceValidationModule,
    PublicationReadinessModule,
    PublishingWorkflowFeatureModule,
    AmazonKdpModule,
    Draft2DigitalModule,
    GooglePlayBooksModule,
    MultiPlatformPublishingModule,
    PublicationStatusSyncModule,
    PublishingHistoryModule,
    SalesIngestionModule,
    RoyaltyIngestionModule,
    SalesRoyaltyNormalizationModule,
    BookAnalyticsModule,
    OpportunityAnalyticsModule,
    AIInsightsModule,
    NotificationModule,
    SettingsModule,
    BackgroundJobModule,
    ResilienceModule,
    DashboardModule,
    WorkflowContextModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware, RateLimitMiddleware).forRoutes('*');
  }
}

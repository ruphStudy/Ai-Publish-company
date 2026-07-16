import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { GlobalConfigModule } from './core/config/global-config.module';
import { GlobalLoggerModule } from './core/logger/global-logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ExampleModule } from './modules/example/example.module';
import { CategoryModule } from './modules/category/category.module';
import { BookModule } from './modules/book/book.module';
import { BookProjectModule } from './modules/book-project/book-project.module';
import { MarketIntelligenceModule } from './modules/market-intelligence/market-intelligence.module';
import { AuditModule } from './modules/audit/audit.module';
import { CacheInfrastructureModule } from './infrastructure/cache/cache.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { QueueInfrastructureModule } from './infrastructure/queue/queue.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [
    GlobalConfigModule,
    GlobalLoggerModule,
    DatabaseModule,
    CacheInfrastructureModule,
    QueueInfrastructureModule,
    StorageModule,
    AuthModule,
    CategoryModule,
    BookModule,
    BookProjectModule,
    MarketIntelligenceModule,
    AuditModule,
    HealthModule,
    ExampleModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RedisHealthIndicator } from './indicators/redis.health';
import { CacheInfrastructureModule } from '../../infrastructure/cache/cache.module';

@Module({
  imports: [TerminusModule, CacheInfrastructureModule],
  controllers: [HealthController],
  providers: [HealthService, RedisHealthIndicator],
})
export class HealthModule {}

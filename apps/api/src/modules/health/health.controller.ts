import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  MongooseHealthIndicator} from '@nestjs/terminus';
import {
  HealthCheck
} from '@nestjs/terminus';

import { HealthService } from './health.service';
import type { HealthResponse } from './health.service';
import { RedisHealthIndicator } from './indicators/redis.health';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthService: HealthService,
    private readonly mongooseHealth: MongooseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'General health check' })
  async check(): Promise<HealthResponse> {
    return this.healthService.buildHealthResponse();
  }

  @Get('db')
  @HealthCheck()
  @ApiOperation({ summary: 'Database health check' })
  async checkDatabase(): Promise<HealthResponse> {
    const result = await this.health.check([
      () => this.mongooseHealth.pingCheck('mongodb'),
    ]);

    return this.healthService.buildHealthResponse({
      mongodb: result.details.mongodb,
    });
  }

  @Get('redis')
  @HealthCheck()
  @ApiOperation({ summary: 'Redis health check' })
  async checkRedis(): Promise<HealthResponse> {
    const result = await this.health.check([
      () => this.redisHealth.isHealthy('redis'),
    ]);

    return this.healthService.buildHealthResponse({
      redis: result.details.redis,
    });
  }
}

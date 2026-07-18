import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { ProviderHealthResult } from '../interfaces/provider.interface';
import { ProviderStatus } from '../interfaces/provider.interface';

export class ProviderRegistrationResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'amazon-kdp-v1' })
  key: string;

  @ApiProperty({ example: 'Amazon KDP Market Data' })
  name: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ enum: DataSourceProvider, example: DataSourceProvider.MANUAL })
  provider: DataSourceProvider;

  @ApiProperty({ enum: ProviderStatus, example: ProviderStatus.INACTIVE })
  status: ProviderStatus;

  @ApiProperty({ example: 5 })
  priority: number;

  @ApiProperty({ example: false })
  isEnabled: boolean;

  @ApiProperty({ example: 30000 })
  timeoutMs: number;

  @ApiProperty({ example: 3 })
  maxRetries: number;

  @ApiProperty({ example: 5000 })
  retryDelayMs: number;

  @ApiPropertyOptional({ nullable: true, example: 60 })
  rateLimitRpm: number | null;

  @ApiPropertyOptional({ nullable: true, example: 1000 })
  rateLimitRpd: number | null;

  @ApiProperty({ type: 'object', additionalProperties: true, example: {} })
  customConfig: Record<string, unknown>;

  @ApiPropertyOptional({ nullable: true })
  lastHealthCheckAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lastHealthStatus: boolean | null;

  @ApiPropertyOptional({ nullable: true })
  lastHealthLatencyMs: number | null;

  @ApiPropertyOptional({ nullable: true })
  lastHealthError: string | null;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  updatedAt: Date;
}

export class PaginatedProviderResponseDto {
  @ApiProperty({ type: [ProviderRegistrationResponseDto] })
  data: ProviderRegistrationResponseDto[];

  @ApiProperty({ example: { total: 5, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false } })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class ProviderHealthSummaryResponseDto {
  @ApiProperty({ enum: ['healthy', 'degraded', 'unhealthy'], example: 'healthy' })
  overallStatus: string;

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 3 })
  available: number;

  @ApiProperty({ example: 2 })
  unavailable: number;

  @ApiProperty({ type: 'array', description: 'Individual provider health results' })
  providers: ProviderHealthResult[];

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  checkedAt: Date;
}

export class ProviderValidationResponseDto {
  @ApiProperty({ example: 'amazon-kdp-v1' })
  key: string;

  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ type: [String], example: [] })
  errors: string[];
}

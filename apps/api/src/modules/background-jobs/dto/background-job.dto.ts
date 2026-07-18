import { IsBoolean, IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { JobExecutionStatus, JobOverlapPolicy, JobScheduleStatus, JobScheduleType } from '../entities/background-job.entity';

export class JobExecutionQueryDto {
  @IsOptional() @IsString() jobKey?: string;
  @IsOptional() @IsString() queue?: string;
  @IsOptional() @IsEnum(JobExecutionStatus) status?: JobExecutionStatus;
  @IsOptional() @IsString() tenantId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsBoolean() deadLetter?: boolean;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) limit?: number;
}

export class TriggerJobDto {
  @IsString() jobKey: string;
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
  @IsOptional() @IsString() tenantId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() providerKey?: string;
  @IsOptional() @IsString() marketplaceKey?: string;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsString() correlationId?: string;
}

export class UpsertJobScheduleDto {
  @IsOptional() @IsString() scheduleId?: string;
  @IsString() jobKey: string;
  @IsString() name: string;
  @IsEnum(JobScheduleType) type: JobScheduleType;
  @IsOptional() @IsString() cron?: string;
  @IsOptional() @IsNumber() intervalMs?: number;
  @IsOptional() @IsDateString() runAt?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsEnum(JobOverlapPolicy) overlapPolicy?: JobOverlapPolicy;
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
  @IsOptional() @IsString() tenantId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() providerKey?: string;
  @IsOptional() @IsString() marketplaceKey?: string;
}

export class ScheduleQueryDto {
  @IsOptional() @IsString() jobKey?: string;
  @IsOptional() @IsEnum(JobScheduleStatus) status?: JobScheduleStatus;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) limit?: number;
}

export class CancelJobDto { @IsOptional() @IsString() reason?: string; }

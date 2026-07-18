import { IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { CircuitState, FailureCategory, RecoveryStatus, ResilienceIsolationScope } from '../entities/resilience.entity';

export class RecoveryQueryDto {
  @IsOptional() @IsEnum(RecoveryStatus) status?: RecoveryStatus;
  @IsOptional() @IsEnum(FailureCategory) failureCategory?: FailureCategory;
  @IsOptional() @IsString() policyKey?: string;
  @IsOptional() @IsString() tenantId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() providerKey?: string;
  @IsOptional() @IsString() marketplaceKey?: string;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) limit?: number;
}

export class CircuitQueryDto {
  @IsOptional() @IsString() policyKey?: string;
  @IsOptional() @IsEnum(ResilienceIsolationScope) isolationScope?: ResilienceIsolationScope;
  @IsOptional() @IsEnum(CircuitState) state?: CircuitState;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) limit?: number;
}

export class RecordFailureDto {
  @IsString() policyKey: string;
  @IsString() operationKey: string;
  @IsEnum(FailureCategory) failureCategory: FailureCategory;
  @IsOptional() @IsEnum(ResilienceIsolationScope) isolationScope?: ResilienceIsolationScope;
  @IsOptional() @IsString() isolationKey?: string;
  @IsOptional() @IsString() tenantId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() providerKey?: string;
  @IsOptional() @IsString() marketplaceKey?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() correlationId?: string;
  @IsOptional() @IsString() errorCode?: string;
  @IsOptional() @IsString() errorMessage?: string;
  @IsOptional() @IsObject() safeContext?: Record<string, unknown>;
}

export class ManualRecoveryDto {
  @IsOptional() @IsString() note?: string;
}

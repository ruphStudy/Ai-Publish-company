import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { PublishingScope, PublishingTargetType, PublishingWorkflowStatus } from '../entities/publishing-workflow.entity';

export class PublishingTargetConfigDto { @IsEnum(PublishingTargetType) targetType: PublishingTargetType; @IsString() targetKey: string; @IsString() providerKey: string; @IsOptional() @IsString() configurationProfile?: string; @IsOptional() @IsArray() @IsString({ each: true }) requestedFormats?: string[]; }
export class CreatePublishingWorkflowDto { @IsMongoId() projectId: string; @IsString() manuscriptVersion: string; @IsEnum(PublishingScope) publicationScope: PublishingScope; @IsOptional() @IsString() policyProfile?: string; @IsOptional() @ValidateNested({ each: true }) @Type(() => PublishingTargetConfigDto) targets?: PublishingTargetConfigDto[]; @IsOptional() @IsDateString() scheduledAt?: string; @IsOptional() @IsString() idempotencyKey?: string; @IsOptional() @IsString() requestedBy?: string; }
export class PublishingWorkflowQueryDto { @IsOptional() @IsMongoId() projectId?: string; @IsOptional() @IsString() manuscriptVersion?: string; @IsOptional() @IsEnum(PublishingWorkflowStatus) status?: PublishingWorkflowStatus; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20; }
export class PublishingActionDto { @IsOptional() @IsString() reason?: string; }

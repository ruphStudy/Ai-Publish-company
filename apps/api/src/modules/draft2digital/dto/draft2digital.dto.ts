import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Draft2DigitalChecklistStatus, Draft2DigitalFormat, Draft2DigitalStatus } from '../entities/draft2digital.entity';

export class PrepareDraft2DigitalPackageDto { @IsMongoId() workflowId: string; @IsMongoId() targetExecutionId: string; @IsMongoId() projectId: string; @IsString() manuscriptVersion: string; @IsEnum(Draft2DigitalFormat) d2dFormat: Draft2DigitalFormat; @IsOptional() @IsString() createdBy?: string; }
export class UpdateDraft2DigitalChecklistItemDto { @Type(() => Number) @IsNumber() @Min(1) sequence: number; @IsEnum(Draft2DigitalChecklistStatus) completionStatus: Draft2DigitalChecklistStatus; }
export class RecordDraft2DigitalSubmissionDto { @IsOptional() @IsString() externalTitleId?: string; @IsOptional() @IsString() isbn?: string; @IsOptional() @IsString() statusMessage?: string; @IsOptional() @IsString() submittedBy?: string; }
export class UpdateDraft2DigitalStatusDto { @IsEnum(Draft2DigitalStatus) status: Draft2DigitalStatus; @IsOptional() @IsString() statusMessage?: string; @IsOptional() @IsString() recordedBy?: string; }
export class Draft2DigitalQueryDto { @IsOptional() @IsMongoId() projectId?: string; @IsOptional() @IsString() targetExecutionId?: string; @IsOptional() @IsEnum(Draft2DigitalStatus) status?: Draft2DigitalStatus; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20; }

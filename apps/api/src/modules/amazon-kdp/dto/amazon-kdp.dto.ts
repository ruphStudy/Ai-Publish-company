import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { AmazonKdpChecklistStatus, AmazonKdpFormat, AmazonKdpStatus } from '../entities/amazon-kdp.entity';

export class PrepareAmazonKdpPackageDto { @IsMongoId() workflowId: string; @IsMongoId() targetExecutionId: string; @IsMongoId() projectId: string; @IsString() manuscriptVersion: string; @IsEnum(AmazonKdpFormat) kdpFormat: AmazonKdpFormat; @IsOptional() @IsString() createdBy?: string; }
export class UpdateAmazonKdpChecklistItemDto { @Type(() => Number) @IsNumber() @Min(1) sequence: number; @IsEnum(AmazonKdpChecklistStatus) completionStatus: AmazonKdpChecklistStatus; }
export class RecordAmazonKdpSubmissionDto { @IsOptional() @IsString() kdpAccountProfileReference?: string; @IsOptional() @IsString() bookshelfTitleReference?: string; @IsOptional() @IsString() asin?: string; @IsOptional() @IsString() isbn?: string; @IsOptional() @IsString() externalTitleId?: string; @IsOptional() @IsString() statusMessage?: string; @IsOptional() @IsString() submittedBy?: string; }
export class UpdateAmazonKdpStatusDto { @IsEnum(AmazonKdpStatus) status: AmazonKdpStatus; @IsOptional() @IsString() statusMessage?: string; @IsOptional() @IsString() publishedUrl?: string; @IsOptional() @IsString() recordedBy?: string; }
export class AmazonKdpQueryDto { @IsOptional() @IsMongoId() projectId?: string; @IsOptional() @IsString() targetExecutionId?: string; @IsOptional() @IsEnum(AmazonKdpStatus) status?: AmazonKdpStatus; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20; }

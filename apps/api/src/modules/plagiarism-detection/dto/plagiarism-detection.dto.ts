import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PlagiarismDetectionScope, PlagiarismDetectionStatus, PlagiarismTargetType } from '../entities/plagiarism-detection.entity';
export class CreatePlagiarismDetectionDto { @IsMongoId() projectId: string; @IsEnum(PlagiarismTargetType) targetType: PlagiarismTargetType; @IsString() targetId: string; @IsEnum(PlagiarismDetectionScope) scope: PlagiarismDetectionScope; @IsString() manuscriptVersion: string; @IsOptional() @IsString() createdBy?: string; }
export class PlagiarismDetectionQueryDto { @IsOptional() @IsMongoId() projectId?: string; @IsOptional() @IsString() targetId?: string; @IsOptional() @IsEnum(PlagiarismDetectionStatus) status?: PlagiarismDetectionStatus; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20; }

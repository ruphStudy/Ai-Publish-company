import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ComplianceLevel, ComplianceValidationScope, ComplianceValidationStatus, ComplianceValidationTargetType } from '../entities/compliance-validation.entity';

export class CreateComplianceValidationDto { @IsMongoId() projectId: string; @IsEnum(ComplianceValidationTargetType) targetType: ComplianceValidationTargetType; @IsString() targetId: string; @IsEnum(ComplianceValidationScope) scope: ComplianceValidationScope; @IsString() manuscriptVersion: string; @IsOptional() @IsString() createdBy?: string; }
export class ComplianceValidationQueryDto { @IsOptional() @IsMongoId() projectId?: string; @IsOptional() @IsString() targetId?: string; @IsOptional() @IsEnum(ComplianceValidationStatus) status?: ComplianceValidationStatus; @IsOptional() @IsEnum(ComplianceLevel) complianceLevel?: ComplianceLevel; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20; }

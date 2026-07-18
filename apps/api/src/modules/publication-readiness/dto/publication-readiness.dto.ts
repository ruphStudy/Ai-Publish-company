import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PublicationDecision, PublicationReadinessStatus, ReadinessPolicyProfile, ReadinessScope, ReadinessTargetType } from '../entities/publication-readiness.entity';

export class CreatePublicationReadinessDto { @IsMongoId() projectId: string; @IsEnum(ReadinessTargetType) targetType: ReadinessTargetType; @IsString() targetId: string; @IsEnum(ReadinessScope) scope: ReadinessScope; @IsString() manuscriptVersion: string; @IsOptional() @IsEnum(ReadinessPolicyProfile) policyProfile?: ReadinessPolicyProfile; @IsOptional() @IsString() createdBy?: string; }
export class RejectPublicationReadinessDto { @IsOptional() @IsString() reason?: string; }
export class PublicationReadinessQueryDto { @IsOptional() @IsMongoId() projectId?: string; @IsOptional() @IsString() targetId?: string; @IsOptional() @IsString() manuscriptVersion?: string; @IsOptional() @IsEnum(ReadinessPolicyProfile) policyProfile?: ReadinessPolicyProfile; @IsOptional() @IsEnum(PublicationReadinessStatus) status?: PublicationReadinessStatus; @IsOptional() @IsEnum(PublicationDecision) finalDecision?: PublicationDecision; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1; @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20; }

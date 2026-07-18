import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { SettingCategory, SettingScope } from '../entities/setting.entity';
import type { SettingValuePayload } from '../entities/setting.entity';

export class SettingScopeContextDto {
  @IsOptional() @IsString() environment?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() providerKey?: string;
  @IsOptional() @IsString() marketplaceKey?: string;
  @IsOptional() @IsString() featureKey?: string;
  @IsOptional() @IsString() moduleKey?: string;
}

export class SettingsQueryDto extends SettingScopeContextDto {
  @IsOptional() @IsEnum(SettingCategory) category?: SettingCategory;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(SettingScope) scope?: SettingScope;
}

export class UpdateSettingDto extends SettingScopeContextDto {
  @IsEnum(SettingScope) scope: SettingScope;
  @IsOptional() @IsString() scopeId?: string | null;
  value: SettingValuePayload;
}

export class ResetSettingDto extends SettingScopeContextDto {
  @IsEnum(SettingScope) scope: SettingScope;
  @IsOptional() @IsString() scopeId?: string | null;
}

export class ImportSettingsDto {
  @IsArray() items: Array<{ key: string; scope: SettingScope; scopeId?: string | null; value: SettingValuePayload }>;
}

export class ExportSettingsDto extends SettingsQueryDto {
  @IsOptional() @IsBoolean() includeDefaults?: boolean;
}

export class EvaluateFeatureFlagDto extends SettingScopeContextDto {
  @IsString() key: string;
}

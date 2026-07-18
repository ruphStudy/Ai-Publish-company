import type { SettingCategory, SettingDataType, SettingScope, SettingValuePayload, SettingVisibility } from '../entities/setting.entity';

export interface SettingValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowNull?: boolean;
  custom?: string;
}

export interface SettingDeprecationMetadata {
  deprecated: boolean;
  replacementKey?: string;
  sunsetAt?: string;
}

export interface SettingVersionMetadata {
  introducedIn: string;
  updatedIn?: string;
  migrationKey?: string;
}

export interface SettingDefinition<TValue extends SettingValuePayload = SettingValuePayload> {
  key: string;
  category: SettingCategory;
  displayName: string;
  description: string;
  dataType: SettingDataType;
  scopes: SettingScope[];
  defaultValue: TValue;
  validation?: SettingValidationRules;
  allowedValues?: TValue[];
  requiredPermissions?: string[];
  visibility: SettingVisibility;
  encrypted?: boolean;
  restartRequired?: boolean;
  featureDependency?: string;
  deprecation?: SettingDeprecationMetadata;
  version: SettingVersionMetadata;
}

export interface SettingResolutionContext {
  environment?: string;
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  providerKey?: string;
  marketplaceKey?: string;
  featureKey?: string;
  moduleKey?: string;
}

export interface ResolvedSetting<TValue extends SettingValuePayload = SettingValuePayload> {
  key: string;
  value: TValue | '********';
  sourceScope: SettingScope;
  sourceScopeId: string | null;
  inherited: boolean;
  encrypted: boolean;
  restartRequired: boolean;
  definition: SettingDefinition<TValue>;
}

export interface SettingImportItem {
  key: string;
  scope: SettingScope;
  scopeId?: string | null;
  value: SettingValuePayload;
}

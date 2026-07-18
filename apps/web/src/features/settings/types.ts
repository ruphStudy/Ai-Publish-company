export type SettingCategory =
  | 'GENERAL'
  | 'AUTHENTICATION'
  | 'SECURITY'
  | 'NOTIFICATIONS'
  | 'AI'
  | 'ANALYTICS'
  | 'PUBLISHING'
  | 'PROVIDERS'
  | 'MARKETPLACES'
  | 'IMPORTS'
  | 'SYNCHRONIZATION'
  | 'REVENUE'
  | 'SALES'
  | 'ROYALTIES'
  | 'BACKGROUND_JOBS'
  | 'PERFORMANCE'
  | 'INTEGRATIONS'
  | 'API'
  | 'UI'
  | 'FEATURE_FLAGS'
  | 'STORAGE'
  | 'LOGGING'
  | 'MONITORING';

export type SettingScope = 'DEFAULT' | 'SYSTEM' | 'ENVIRONMENT' | 'WORKSPACE' | 'PROJECT' | 'USER' | 'PROVIDER' | 'MARKETPLACE' | 'FEATURE' | 'MODULE';
export type SettingDataType = 'STRING' | 'NUMBER' | 'DECIMAL' | 'BOOLEAN' | 'ENUM' | 'JSON' | 'DURATION' | 'URL' | 'EMAIL' | 'SECRET' | 'LIST' | 'MAP';
export type SettingValue = string | number | boolean | null | Array<string | number | boolean | null> | Record<string, unknown>;

export interface SettingDefinition {
  key: string;
  category: SettingCategory;
  displayName: string;
  description: string;
  dataType: SettingDataType;
  scopes: SettingScope[];
  defaultValue: SettingValue;
  allowedValues?: SettingValue[];
  requiredPermissions?: string[];
  visibility: 'PUBLIC' | 'AUTHENTICATED' | 'ADMIN' | 'SECRET';
  encrypted?: boolean;
  restartRequired?: boolean;
  featureDependency?: string;
  version: { introducedIn: string; updatedIn?: string };
}

export interface ResolvedSetting {
  key: string;
  value: SettingValue | '********';
  sourceScope: SettingScope;
  sourceScopeId: string | null;
  inherited: boolean;
  encrypted: boolean;
  restartRequired: boolean;
  definition: SettingDefinition;
}

export interface SettingCategoryItem {
  key: SettingCategory;
  label: string;
}

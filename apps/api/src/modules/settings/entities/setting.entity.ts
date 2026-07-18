import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum SettingCategory {
  GENERAL = 'GENERAL',
  AUTHENTICATION = 'AUTHENTICATION',
  SECURITY = 'SECURITY',
  NOTIFICATIONS = 'NOTIFICATIONS',
  AI = 'AI',
  ANALYTICS = 'ANALYTICS',
  PUBLISHING = 'PUBLISHING',
  PROVIDERS = 'PROVIDERS',
  MARKETPLACES = 'MARKETPLACES',
  IMPORTS = 'IMPORTS',
  SYNCHRONIZATION = 'SYNCHRONIZATION',
  REVENUE = 'REVENUE',
  SALES = 'SALES',
  ROYALTIES = 'ROYALTIES',
  BACKGROUND_JOBS = 'BACKGROUND_JOBS',
  PERFORMANCE = 'PERFORMANCE',
  INTEGRATIONS = 'INTEGRATIONS',
  API = 'API',
  UI = 'UI',
  FEATURE_FLAGS = 'FEATURE_FLAGS',
  STORAGE = 'STORAGE',
  LOGGING = 'LOGGING',
  MONITORING = 'MONITORING',
}

export enum SettingScope {
  DEFAULT = 'DEFAULT',
  SYSTEM = 'SYSTEM',
  ENVIRONMENT = 'ENVIRONMENT',
  WORKSPACE = 'WORKSPACE',
  PROJECT = 'PROJECT',
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  MARKETPLACE = 'MARKETPLACE',
  FEATURE = 'FEATURE',
  MODULE = 'MODULE',
}

export enum SettingDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DECIMAL = 'DECIMAL',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
  JSON = 'JSON',
  DURATION = 'DURATION',
  URL = 'URL',
  EMAIL = 'EMAIL',
  SECRET = 'SECRET',
  LIST = 'LIST',
  MAP = 'MAP',
}

export enum SettingVisibility {
  PUBLIC = 'PUBLIC',
  AUTHENTICATED = 'AUTHENTICATED',
  ADMIN = 'ADMIN',
  SECRET = 'SECRET',
}

export enum SettingValueStatus {
  ACTIVE = 'ACTIVE',
  RESET = 'RESET',
  DEPRECATED = 'DEPRECATED',
}

export type SettingPrimitive = string | number | boolean | null;
export type SettingValuePayload = SettingPrimitive | SettingPrimitive[] | Record<string, unknown>;

@Schema({ collection: 'setting_values', timestamps: true, versionKey: 'version' })
export class SettingValue extends Document {
  @Prop({ required: true, index: true }) settingValueId: string;
  @Prop({ required: true, index: true }) key: string;
  @Prop({ type: String, enum: SettingCategory, required: true, index: true }) category: SettingCategory;
  @Prop({ type: String, enum: SettingScope, required: true, index: true }) scope: SettingScope;
  @Prop({ type: String, default: null, index: true }) scopeId: string | null;
  @Prop({ type: MongooseSchema.Types.Mixed, default: null }) value: SettingValuePayload;
  @Prop({ type: Boolean, default: false }) encrypted: boolean;
  @Prop({ type: String, default: null }) encryptionKeyVersion: string | null;
  @Prop({ type: String, enum: SettingValueStatus, default: SettingValueStatus.ACTIVE, index: true }) status: SettingValueStatus;
  @Prop({ type: String, default: null }) environment: string | null;
  @Prop({ type: String, default: null }) workspaceId: string | null;
  @Prop({ type: String, default: null }) projectId: string | null;
  @Prop({ type: String, default: null }) userId: string | null;
  @Prop({ type: String, default: null }) providerKey: string | null;
  @Prop({ type: String, default: null }) marketplaceKey: string | null;
  @Prop({ type: String, default: null }) featureKey: string | null;
  @Prop({ type: String, default: null }) moduleKey: string | null;
  @Prop({ type: Number, default: 1 }) schemaVersion: number;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: Boolean, default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingValueDocument = SettingValue & Document;
export const SettingValueSchema = SchemaFactory.createForClass(SettingValue);

SettingValueSchema.index({ key: 1, scope: 1, scopeId: 1, isDeleted: 1 }, { unique: true });
SettingValueSchema.index({ category: 1, scope: 1, isDeleted: 1 });
SettingValueSchema.index({ workspaceId: 1, projectId: 1, userId: 1, isDeleted: 1 });
SettingValueSchema.index({ providerKey: 1, marketplaceKey: 1, isDeleted: 1 });
SettingValueSchema.index({ featureKey: 1, isDeleted: 1 });

SettingValueSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {
  if (!this.getOptions()?.includeDeleted) this.where({ isDeleted: { $ne: true } });
  next();
});

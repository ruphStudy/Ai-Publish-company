import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  ROLE_CHANGE = 'role_change',
}

export enum AuditEntityType {
  USER = 'User',
  CATEGORY = 'Category',
  SUBCATEGORY = 'Subcategory',
  BOOK = 'Book',
}

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog extends Document {
  @Prop({
    type: String,
    enum: AuditAction,
    required: true,
    index: true,
  })
  action: AuditAction;

  @Prop({
    type: String,
    enum: AuditEntityType,
    required: true,
    index: true,
  })
  entityType: AuditEntityType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    index: true,
  })
  entityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  performedBy: Types.ObjectId;

  @Prop({ type: String, trim: true })
  ipAddress: string;

  @Prop({ type: String, trim: true })
  userAgent: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  changes: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  previousValues: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValues: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;

  @Prop({ type: String, trim: true, maxlength: 500 })
  description: string;

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for efficient querying
AuditLogSchema.index({ action: 1, entityType: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entityId: 1, createdAt: -1 });

// Compound index for common queries
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, action: 1, createdAt: -1 });

// TTL index to auto-delete old logs after 2 years (optional)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

// Make audit logs immutable (prevent updates and deletes)
AuditLogSchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Audit logs are immutable and cannot be updated'));
});

AuditLogSchema.pre('findOneAndDelete', function (next) {
  next(new Error('Audit logs are immutable and cannot be deleted'));
});

AuditLogSchema.pre('updateOne', function (next) {
  next(new Error('Audit logs are immutable and cannot be updated'));
});

AuditLogSchema.pre('deleteOne', function (next) {
  next(new Error('Audit logs are immutable and cannot be deleted'));
});

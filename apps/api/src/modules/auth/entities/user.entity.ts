import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 50 })
  firstName: string;

  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 50 })
  lastName: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.VIEWER] })
  roles: UserRole[];

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: String, default: null, select: false })
  refreshToken: string | null;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1, isDeleted: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ roles: 1 });

// Query middleware to exclude soft-deleted documents by default
UserSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {
  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

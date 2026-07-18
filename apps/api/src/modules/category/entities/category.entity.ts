import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true, collection: 'categories' })
export class Category extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
    index: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 200,
  })
  slug: string;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  description: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ type: Number, default: 0, min: 0 })
  displayOrder: number;

  @Prop({
    type: String,
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    index: true,
  })
  status: CategoryStatus;

  @Prop({ type: String, default: null })
  icon: string | null;

  @Prop({ type: String, default: null })
  color: string | null;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// ── Indexes ────────────────────────────────────────────────────
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ name: 1 });
CategorySchema.index({ status: 1, isDeleted: 1 });
CategorySchema.index({ displayOrder: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ createdAt: -1 });
CategorySchema.index(
  { name: 'text', description: 'text' },
  { name: 'idx_categories_text_search' },
);

// ── Query middleware — auto-exclude soft-deleted documents ──────
CategorySchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {
  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// ── Schema-level slug validation ────────────────────────────────
CategorySchema.path('slug').validate(
  (value: string) => /^[a-z0-9-]+$/.test(value),
  'Slug must contain only lowercase letters, numbers, and hyphens',
);

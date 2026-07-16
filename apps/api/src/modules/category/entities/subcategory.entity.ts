import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'subcategories' })
export class Subcategory extends Document {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
    index: true,
  })
  name: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
  })
  slug: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  categoryId: Types.ObjectId;

  @Prop({ type: String, default: null })
  icon: string | null;

  @Prop({ type: Number, default: 0, min: 0 })
  order: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false, index: true })
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

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

// Indexes
SubcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });
SubcategorySchema.index({ categoryId: 1, order: 1 });
SubcategorySchema.index({ name: 1 });
SubcategorySchema.index({ isActive: 1, isDeleted: 1 });
SubcategorySchema.index({ createdAt: -1 });

// Text search index
SubcategorySchema.index({ name: 'text', description: 'text' });

// Compound index for active subcategories by category
SubcategorySchema.index({ categoryId: 1, isActive: 1, isDeleted: 1 });

// Query middleware to exclude soft-deleted documents
SubcategorySchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Validation: Ensure slug is URL-friendly
SubcategorySchema.path('slug').validate(function (value: string) {
  return /^[a-z0-9-]+$/.test(value);
}, 'Slug must contain only lowercase letters, numbers, and hyphens');

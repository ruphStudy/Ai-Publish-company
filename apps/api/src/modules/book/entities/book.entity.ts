import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum BookStage {
  IDEA = 'idea',
  OUTLINE = 'outline',
  DRAFT = 'draft',
  REVIEW = 'review',
  FINAL = 'final',
}

@Schema({ timestamps: true, collection: 'books' })
export class Book extends Document {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 200, index: true })
  title: string;

  @Prop({ type: String, trim: true, maxlength: 300, default: null })
  subtitle: string | null;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 220,
  })
  slug: string;

  @Prop({ type: String, trim: true, maxlength: 2000, default: null })
  description: string | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  summary: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId: Types.ObjectId;

  @Prop({ type: String, enum: BookStatus, default: BookStatus.DRAFT, index: true })
  status: BookStatus;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 10, index: true })
  language: string;

  @Prop({ type: String, trim: true, maxlength: 200, default: null })
  targetAudience: string | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  objective: string | null;

  @Prop({ type: Number, default: null, min: 1 })
  estimatedPages: number | null;

  @Prop({ type: String, enum: BookStage, default: BookStage.IDEA, index: true })
  currentStage: BookStage;

  @Prop({ type: Number, default: null, min: 0, max: 100 })
  qualityScore: number | null;

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

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ slug: 1 }, { unique: true });
BookSchema.index(
  { title: 1, language: 1 },
  { unique: true, name: 'idx_books_title_language_unique' },
);
BookSchema.index({ categoryId: 1 });
BookSchema.index({ status: 1, isDeleted: 1 });
BookSchema.index({ language: 1, isDeleted: 1 });
BookSchema.index({ currentStage: 1 });
BookSchema.index({ createdAt: -1 });
BookSchema.index(
  { title: 'text', description: 'text', summary: 'text' },
  { name: 'idx_books_text_search' },
);

BookSchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }
  next();
});

BookSchema.path('slug').validate(
  (value: string) => /^[a-z0-9-]+$/.test(value),
  'Slug must contain only lowercase letters, numbers, and hyphens',
);

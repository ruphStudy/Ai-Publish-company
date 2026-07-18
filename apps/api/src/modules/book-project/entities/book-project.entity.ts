import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum BookProjectStatus {
  DRAFT = 'DRAFT',
  RESEARCHING = 'RESEARCHING',
  OUTLINE_READY = 'OUTLINE_READY',
  WRITING = 'WRITING',
  REVIEWING = 'REVIEWING',
  READY_FOR_PUBLISHING = 'READY_FOR_PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum BookProjectStage {
  PROJECT_CREATED = 'PROJECT_CREATED',
  RESEARCH = 'RESEARCH',
  OUTLINE = 'OUTLINE',
  CHAPTER_GENERATION = 'CHAPTER_GENERATION',
  EDITING = 'EDITING',
  HUMANIZATION = 'HUMANIZATION',
  QUALITY_CHECK = 'QUALITY_CHECK',
  EXPORT = 'EXPORT',
  PUBLISHING = 'PUBLISHING',
}

@Schema({ timestamps: true, collection: 'book_projects' })
export class BookProject extends Document {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 100,
    index: true,
  })
  projectCode: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 300, index: true })
  title: string;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  subtitle: string | null;

  @Prop({ type: String, trim: true, maxlength: 5000, default: null })
  description: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subcategory', default: null, index: true })
  subCategoryId: Types.ObjectId | null;

  @Prop({ type: String, trim: true, maxlength: 300, default: null, index: true })
  niche: string | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  microNiche: string | null;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 10, index: true })
  language: string;

  @Prop({ required: true, trim: true, maxlength: 100, index: true })
  targetMarket: string;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  targetAudience: string | null;

  @Prop({ type: String, trim: true, maxlength: 100, default: null })
  writingStyle: string | null;

  @Prop({ type: String, trim: true, maxlength: 100, default: null })
  tone: string | null;

  @Prop({ type: String, trim: true, maxlength: 1000, default: null })
  objective: string | null;

  @Prop({ type: Number, default: null, min: 1 })
  estimatedWordCount: number | null;

  @Prop({ type: Number, default: null, min: 1 })
  estimatedChapterCount: number | null;

  @Prop({ type: [String], default: [] })
  targetPlatforms: string[];

  @Prop({ type: String, trim: true, maxlength: 200, default: null })
  aiModel: string | null;

  @Prop({
    type: String,
    enum: BookProjectStatus,
    default: BookProjectStatus.DRAFT,
    index: true,
  })
  status: BookProjectStatus;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  progress: number;

  @Prop({
    type: String,
    enum: BookProjectStage,
    default: BookProjectStage.PROJECT_CREATED,
    index: true,
  })
  currentStage: BookProjectStage;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Number, required: true, default: 1, min: 1 })
  version: number;

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

export const BookProjectSchema = SchemaFactory.createForClass(BookProject);

BookProjectSchema.index(
  { projectCode: 1 },
  { unique: true, name: 'idx_book_projects_project_code_unique' },
);
BookProjectSchema.index({ categoryId: 1, subCategoryId: 1, isDeleted: 1 });
BookProjectSchema.index({ ownerId: 1, status: 1, isDeleted: 1 });
BookProjectSchema.index({ language: 1, targetMarket: 1, isDeleted: 1 });
BookProjectSchema.index({ currentStage: 1, isDeleted: 1 });
BookProjectSchema.index({ progress: -1, isDeleted: 1 });
BookProjectSchema.index({ createdAt: -1 });
BookProjectSchema.index({ updatedAt: -1 });
BookProjectSchema.index(
  {
    projectCode: 'text',
    title: 'text',
    description: 'text',
    niche: 'text',
    microNiche: 'text',
    tags: 'text',
  },
  { name: 'idx_book_projects_text_search' },
);

BookProjectSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {

  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

  next();
});

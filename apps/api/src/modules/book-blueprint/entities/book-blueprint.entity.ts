import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum BookBlueprintStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED',
}

@Schema({ timestamps: true, collection: 'book_blueprints' })
export class BookBlueprint extends Document {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 100,
    index: true,
  })
  blueprintId: string;

  @Prop({ type: Types.ObjectId, ref: 'BookProject', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MarketIntelligence', required: true, index: true })
  marketIntelligenceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MarketKnowledge', required: true, index: true })
  knowledgeRecordId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AIClassification', required: true, index: true })
  classificationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'OpportunityScore', required: true, index: true })
  opportunityScoreId: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 300, index: true })
  title: string;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  subtitle: string | null;

  @Prop({ required: true, trim: true, maxlength: 1500 })
  objective: string;

  @Prop({ required: true, trim: true, maxlength: 1500 })
  usp: string;

  @Prop({ type: String, trim: true, maxlength: 200, default: null, index: true })
  genre: string | null;

  @Prop({ type: String, trim: true, maxlength: 300, default: null, index: true })
  niche: string | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  microNiche: string | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  targetAudience: string | null;

  @Prop({ type: String, trim: true, maxlength: 1500, default: null })
  readerPersona: string | null;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 10, index: true })
  language: string;

  @Prop({ type: String, trim: true, maxlength: 100, default: null })
  writingStyle: string | null;

  @Prop({ type: String, trim: true, maxlength: 100, default: null })
  tone: string | null;

  @Prop({ type: Number, required: true, min: 1 })
  estimatedWordCount: number;

  @Prop({ type: Number, required: true, min: 1 })
  estimatedChapterCount: number;

  @Prop({ type: [String], default: [] })
  targetPlatforms: string[];

  @Prop({ type: String, trim: true, maxlength: 2000, default: null })
  publishingStrategy: string | null;

  @Prop({ type: [String], default: [] })
  seoKeywords: string[];

  @Prop({ type: String, trim: true, maxlength: 200, default: null })
  primaryCategory: string | null;

  @Prop({ type: String, trim: true, maxlength: 200, default: null })
  secondaryCategory: string | null;

  @Prop({ type: [String], default: [] })
  chapterObjectives: string[];

  @Prop({ type: String, trim: true, maxlength: 2000, default: null })
  monetizationStrategy: string | null;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({ required: true, trim: true, maxlength: 50, index: true })
  blueprintVersion: string;

  @Prop({
    type: String,
    enum: BookBlueprintStatus,
    required: true,
    default: BookBlueprintStatus.GENERATED,
    index: true,
  })
  status: BookBlueprintStatus;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, unknown>;

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

export const BookBlueprintSchema = SchemaFactory.createForClass(BookBlueprint);

BookBlueprintSchema.index(
  { blueprintId: 1 },
  { unique: true, name: 'idx_book_blueprints_identifier_unique' },
);
BookBlueprintSchema.index({ projectId: 1, createdAt: -1, isDeleted: 1 });
BookBlueprintSchema.index({ knowledgeRecordId: 1, isDeleted: 1 });
BookBlueprintSchema.index({ status: 1, isDeleted: 1 });
BookBlueprintSchema.index({ primaryCategory: 1, secondaryCategory: 1, isDeleted: 1 });
BookBlueprintSchema.index({ confidenceScore: -1, isDeleted: 1 });
BookBlueprintSchema.index({ createdAt: -1 });
BookBlueprintSchema.index(
  {
    blueprintId: 'text',
    title: 'text',
    objective: 'text',
    genre: 'text',
    niche: 'text',
    microNiche: 'text',
    seoKeywords: 'text',
  },
  { name: 'idx_book_blueprints_text_search' },
);

BookBlueprintSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {

  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

  next();
});
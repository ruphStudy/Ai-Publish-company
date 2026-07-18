import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type {
  ChapterContent} from './chapter-content.entity';
import {
  ChapterContentSchema,
} from './chapter-content.entity';

export enum ContentGenerationStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  APPROVED = 'APPROVED',
  REGENERATED = 'REGENERATED',
  FAILED = 'FAILED',
}

export type BookContentDocument = HydratedDocument<BookContent>;

@Schema({
  collection: 'book_contents',
  timestamps: true,
  versionKey: 'version',
})
export class BookContent {
  @Prop({ required: true, unique: true, index: true, trim: true })
  contentId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  blueprintId: string;

  @Prop({ required: true, index: true })
  outlineId: string;

  @Prop({ required: true, index: true })
  chapterId: string;

  @Prop({ required: true, min: 1, index: true })
  chapterNumber: number;

  @Prop({ required: true, trim: true })
  chapterTitle: string;

  @Prop({ type: ChapterContentSchema, required: true })
  chapterContent: ChapterContent;

  @Prop({ required: true })
  generatedContent: string;

  @Prop({ required: true })
  markdownContent: string;

  @Prop({ required: true })
  plainTextContent: string;

  @Prop({ required: true })
  htmlContent: string;

  @Prop({ required: true, min: 1 })
  estimatedReadingTime: number;

  @Prop({ required: true, min: 0 })
  generatedWordCount: number;

  @Prop({ type: Object, required: true })
  tokenUsage: Record<string, number>;

  @Prop({ required: true, min: 0 })
  promptTokens: number;

  @Prop({ required: true, min: 0 })
  completionTokens: number;

  @Prop({ required: true, min: 0 })
  estimatedCost: number;

  @Prop({ required: true, trim: true })
  aiProvider: string;

  @Prop({ required: true, trim: true })
  aiModel: string;

  @Prop({ required: true, min: 0 })
  generationTime: number;

  @Prop({ required: true, trim: true })
  promptVersion: string;

  @Prop({ required: true, trim: true })
  contentVersion: string;

  @Prop({ required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({
    required: true,
    enum: ContentGenerationStatus,
    default: ContentGenerationStatus.PENDING,
    index: true,
  })
  status: ContentGenerationStatus;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ default: null })
  deletedBy?: string;

  @Prop({ default: null })
  createdBy?: string;

  @Prop({ default: null })
  updatedBy?: string;

  createdAt: Date;

  updatedAt: Date;
}

export const BookContentSchema = SchemaFactory.createForClass(BookContent);

BookContentSchema.index({ projectId: 1, chapterNumber: 1, createdAt: -1 });
BookContentSchema.index({ chapterId: 1, createdAt: -1 });
BookContentSchema.index({ outlineId: 1, chapterNumber: 1 });
BookContentSchema.index({ chapterTitle: 'text', generatedContent: 'text' });

BookContentSchema.pre(/^find/, function () {
  const query = this as unknown as {
    getFilter: () => Record<string, unknown>;
    where: (filter: Record<string, unknown>) => unknown;
  };

  if (query.getFilter().isDeleted === undefined) {
    query.where({ isDeleted: false });
  }
});
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type {
  ChapterSection} from './chapter-section.entity';
import {
  ChapterSectionSchema,
} from './chapter-section.entity';

export enum ChapterStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED',
}

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema({
  collection: 'chapter_blueprints',
  timestamps: true,
  versionKey: 'version',
})
export class Chapter {
  @Prop({ required: true, unique: true, index: true, trim: true })
  chapterId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  blueprintId: string;

  @Prop({ required: true, index: true })
  outlineId: string;

  @Prop({ required: true, min: 1, index: true })
  chapterNumber: number;

  @Prop({ required: true, trim: true })
  chapterTitle: string;

  @Prop({ required: true, trim: true })
  objective: string;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ required: true, trim: true })
  introduction: string;

  @Prop({ required: true, trim: true })
  conclusion: string;

  @Prop({ required: true, min: 1 })
  estimatedWordCount: number;

  @Prop({ required: true, min: 1 })
  estimatedReadingTime: number;

  @Prop({ required: true, trim: true })
  writingInstructions: string;

  @Prop({ type: [String], default: [] })
  keyConcepts: string[];

  @Prop({ type: [String], default: [] })
  examples: string[];

  @Prop({ type: [String], default: [] })
  references: string[];

  @Prop({ type: [Number], default: [] })
  dependencies: number[];

  @Prop({ type: [ChapterSectionSchema], default: [] })
  sections: ChapterSection[];

  @Prop({ required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({ required: true, trim: true })
  aiProvider: string;

  @Prop({ required: true, trim: true })
  aiModel: string;

  @Prop({ required: true, trim: true })
  promptVersion: string;

  @Prop({ required: true, trim: true })
  chapterVersion: string;

  @Prop({
    required: true,
    enum: ChapterStatus,
    default: ChapterStatus.PENDING,
    index: true,
  })
  status: ChapterStatus;

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

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

ChapterSchema.index({ projectId: 1, chapterNumber: 1, createdAt: -1 });
ChapterSchema.index({ outlineId: 1, chapterNumber: 1, createdAt: -1 });
ChapterSchema.index({ blueprintId: 1, chapterNumber: 1 });
ChapterSchema.index({ chapterTitle: 'text', summary: 'text', keyConcepts: 'text' });

ChapterSchema.pre(/^find/, function () {
  const query = this as unknown as {
    getFilter: () => Record<string, unknown>;
    where: (filter: Record<string, unknown>) => unknown;
  };

  if (query.getFilter().isDeleted === undefined) {
    query.where({ isDeleted: false });
  }
});
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type {
  ChapterOutline} from './chapter-outline.entity';
import {
  ChapterOutlineSchema,
} from './chapter-outline.entity';

export enum OutlineStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED',
}

export type OutlineDocument = HydratedDocument<Outline>;

@Schema({
  collection: 'outlines',
  timestamps: true,
  versionKey: 'version',
})
export class Outline {
  @Prop({ required: true, unique: true, trim: true, index: true })
  outlineId: string;

  @Prop({ required: true, index: true })
  blueprintId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ required: true, min: 0 })
  totalParts: number;

  @Prop({ required: true, min: 0 })
  totalChapters: number;

  @Prop({ required: true, min: 0 })
  estimatedWordCount: number;

  @Prop({ required: true, min: 0 })
  estimatedReadingTime: number;

  @Prop({ required: true, trim: true })
  outlineSummary: string;

  @Prop({ type: [ChapterOutlineSchema], default: [] })
  chapters: ChapterOutline[];

  @Prop({ required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({ required: true, trim: true })
  aiProvider: string;

  @Prop({ required: true, trim: true })
  aiModel: string;

  @Prop({ required: true, trim: true })
  promptVersion: string;

  @Prop({ required: true, trim: true })
  outlineVersion: string;

  @Prop({
    required: true,
    enum: OutlineStatus,
    default: OutlineStatus.PENDING,
    index: true,
  })
  status: OutlineStatus;

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

export const OutlineSchema = SchemaFactory.createForClass(Outline);

OutlineSchema.index({ blueprintId: 1, createdAt: -1 });
OutlineSchema.index({ projectId: 1, createdAt: -1 });
OutlineSchema.index({ status: 1, isDeleted: 1 });
OutlineSchema.index({ title: 'text', outlineSummary: 'text' });

OutlineSchema.pre(/^find/, function () {
  const query = this as unknown as {
    getFilter: () => Record<string, unknown>;
    where: (value: Record<string, unknown>) => unknown;
  };

  if (query.getFilter().isDeleted === undefined) {
    query.where({ isDeleted: false });
  }
});
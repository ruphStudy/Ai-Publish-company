import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum BookMetadataStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED',
}

export type BookMetadataDocument = HydratedDocument<BookMetadata>;

@Schema({
  collection: 'book_metadata',
  timestamps: true,
  versionKey: 'version',
})
export class BookMetadata {
  @Prop({ required: true, unique: true, index: true, trim: true })
  metadataId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  blueprintId: string;

  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  longDescription: string;

  @Prop({ required: true })
  seoDescription: string;

  @Prop({ required: true })
  amazonDescription: string;

  @Prop({ required: true })
  googleDescription: string;

  @Prop({ required: true })
  draft2digitalDescription: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: [String], default: [] })
  backendKeywords: string[];

  @Prop({ type: [String], default: [] })
  bisacCategories: string[];

  @Prop({ type: [String], default: [] })
  amazonCategories: string[];

  @Prop({ type: [String], default: [] })
  googleCategories: string[];

  @Prop({ required: true, trim: true })
  language: string;

  @Prop({ trim: true })
  readingLevel?: string;

  @Prop({ trim: true })
  ageGroup?: string;

  @Prop({ required: true, trim: true, default: 'First Edition' })
  edition: string;

  @Prop({ trim: true })
  authorName?: string;

  @Prop()
  authorBiography?: string;

  @Prop({ trim: true })
  publisherName?: string;

  @Prop({ required: true })
  copyrightText: string;

  @Prop({ trim: true })
  isbn?: string;

  @Prop({ required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({ required: true, trim: true })
  aiProvider: string;

  @Prop({ required: true, trim: true })
  aiModel: string;

  @Prop({ required: true, trim: true })
  promptVersion: string;

  @Prop({ required: true, trim: true })
  metadataVersion: string;

  @Prop({
    required: true,
    enum: BookMetadataStatus,
    default: BookMetadataStatus.PENDING,
    index: true,
  })
  status: BookMetadataStatus;

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

export const BookMetadataSchema = SchemaFactory.createForClass(BookMetadata);

BookMetadataSchema.index({ projectId: 1, createdAt: -1 });
BookMetadataSchema.index({ blueprintId: 1, createdAt: -1 });
BookMetadataSchema.index({ title: 'text', keywords: 'text', authorName: 'text' });

BookMetadataSchema.pre(/^find/, function () {
  const query = this as unknown as {
    getFilter: () => Record<string, unknown>;
    where: (filter: Record<string, unknown>) => unknown;
  };

  if (query.getFilter().isDeleted === undefined) {
    query.where({ isDeleted: false });
  }
});
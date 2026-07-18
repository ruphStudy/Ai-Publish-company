import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type {
  TableOfContentsItem} from './table-of-contents-item.entity';
import {
  TableOfContentsItemSchema,
} from './table-of-contents-item.entity';

export enum TableOfContentsStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED',
}

export type TableOfContentsDocument = HydratedDocument<TableOfContents>;

@Schema({
  collection: 'table_of_contents',
  timestamps: true,
  versionKey: 'version',
})
export class TableOfContents {
  @Prop({ required: true, unique: true, index: true, trim: true })
  tocId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  blueprintId: string;

  @Prop({ required: true, index: true })
  metadataId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, min: 0 })
  totalParts: number;

  @Prop({ required: true, min: 0 })
  totalChapters: number;

  @Prop({ required: true, min: 0 })
  totalSections: number;

  @Prop({ required: true, min: 1 })
  estimatedPages: number;

  @Prop({ required: true, min: 1 })
  estimatedReadingTime: number;

  @Prop({ type: [TableOfContentsItemSchema], default: [] })
  navigationTree: TableOfContentsItem[];

  @Prop({ type: [TableOfContentsItemSchema], default: [] })
  tocItems: TableOfContentsItem[];

  @Prop({ type: [Object], default: [] })
  pdfBookmarks: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  epubNavigation: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  docxNavigation: Record<string, unknown>[];

  @Prop({ required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({ required: true, trim: true })
  tocVersion: string;

  @Prop({
    required: true,
    enum: TableOfContentsStatus,
    default: TableOfContentsStatus.PENDING,
    index: true,
  })
  status: TableOfContentsStatus;

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

export const TableOfContentsSchema =
  SchemaFactory.createForClass(TableOfContents);

TableOfContentsSchema.index({ projectId: 1, createdAt: -1 });
TableOfContentsSchema.index({ blueprintId: 1, createdAt: -1 });
TableOfContentsSchema.index({ title: 'text' });

TableOfContentsSchema.pre(/^find/, function () {
  const query = this as unknown as {
    getFilter: () => Record<string, unknown>;
    where: (filter: Record<string, unknown>) => unknown;
  };

  if (query.getFilter().isDeleted === undefined) {
    query.where({ isDeleted: false });
  }
});
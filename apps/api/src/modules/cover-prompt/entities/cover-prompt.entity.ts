import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum CoverPromptStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED',
}

export type CoverPromptDocument = HydratedDocument<CoverPrompt>;

@Schema({
  collection: 'cover_prompts',
  timestamps: true,
  versionKey: 'version',
})
export class CoverPrompt {
  @Prop({ required: true, unique: true, index: true, trim: true })
  promptId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  blueprintId: string;

  @Prop({ required: true, index: true })
  metadataId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ required: true, trim: true })
  visualTheme: string;

  @Prop({ required: true, trim: true })
  artStyle: string;

  @Prop({ type: [String], default: [] })
  colorPalette: string[];

  @Prop({ required: true, trim: true })
  typographyStyle: string;

  @Prop({ required: true, trim: true })
  coverLayout: string;

  @Prop({ required: true, trim: true })
  illustrationStyle: string;

  @Prop({ required: true })
  frontCoverPrompt: string;

  @Prop({ required: true })
  backCoverPrompt: string;

  @Prop({ required: true })
  spinePrompt: string;

  @Prop({ required: true })
  wrapCoverPrompt: string;

  @Prop({ required: true })
  thumbnailPrompt: string;

  @Prop({ required: true })
  negativePrompt: string;

  @Prop({ type: [Object], default: [] })
  designVariations: Record<string, unknown>[];

  @Prop({ type: Object, default: {} })
  providerPromptOptions: Record<string, Record<string, string>>;

  @Prop({ required: true, trim: true })
  recommendedImageRatio: string;

  @Prop({ required: true, trim: true })
  recommendedResolution: string;

  @Prop({ required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({ required: true, trim: true })
  promptVersion: string;

  @Prop({
    required: true,
    enum: CoverPromptStatus,
    default: CoverPromptStatus.PENDING,
    index: true,
  })
  status: CoverPromptStatus;

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

export const CoverPromptSchema = SchemaFactory.createForClass(CoverPrompt);

CoverPromptSchema.index({ projectId: 1, createdAt: -1 });
CoverPromptSchema.index({ blueprintId: 1, createdAt: -1 });
CoverPromptSchema.index({ title: 'text', visualTheme: 'text', artStyle: 'text' });

CoverPromptSchema.pre(/^find/, function () {
  const query = this as unknown as {
    getFilter: () => Record<string, unknown>;
    where: (filter: Record<string, unknown>) => unknown;
  };

  if (query.getFilter().isDeleted === undefined) {
    query.where({ isDeleted: false });
  }
});
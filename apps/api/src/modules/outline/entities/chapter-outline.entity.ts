import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ChapterOutlineStatus {
  PENDING = 'PENDING',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED',
}

@Schema({ _id: false })
export class ChapterOutline {
  @Prop({ required: true, min: 1 })
  chapterNumber: number;

  @Prop({ required: true, min: 1 })
  partNumber: number;

  @Prop({ required: true, trim: true })
  partTitle: string;

  @Prop({ required: true, trim: true })
  chapterTitle: string;

  @Prop({ required: true, trim: true })
  objective: string;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ required: true, min: 1 })
  estimatedWordCount: number;

  @Prop({ type: [String], default: [] })
  keyTopics: string[];

  @Prop({ type: [String], default: [] })
  learningOutcomes: string[];

  @Prop({ required: true, trim: true })
  writingInstructions: string;

  @Prop({ type: [String], default: [] })
  references: string[];

  @Prop({
    type: String,
    enum: ChapterOutlineStatus,
    default: ChapterOutlineStatus.GENERATED,
  })
  status: ChapterOutlineStatus;
}

export const ChapterOutlineSchema =
  SchemaFactory.createForClass(ChapterOutline);
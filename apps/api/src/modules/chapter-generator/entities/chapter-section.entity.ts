import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ChapterSubsection {
  @Prop({ required: true, trim: true })
  sectionNumber: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  objective: string;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ required: true, min: 1 })
  estimatedWordCount: number;

  @Prop({ required: true, trim: true })
  writingInstructions: string;

  @Prop({ required: true, min: 1 })
  order: number;
}

export const ChapterSubsectionSchema =
  SchemaFactory.createForClass(ChapterSubsection);

@Schema({ _id: false })
export class ChapterSection {
  @Prop({ required: true, trim: true })
  sectionNumber: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  objective: string;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ required: true, min: 1 })
  estimatedWordCount: number;

  @Prop({ required: true, trim: true })
  writingInstructions: string;

  @Prop({ type: [ChapterSubsectionSchema], default: [] })
  subsections: ChapterSubsection[];

  @Prop({ required: true, min: 1 })
  order: number;
}

export const ChapterSectionSchema =
  SchemaFactory.createForClass(ChapterSection);
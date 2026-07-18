import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ContentSubsection {
  @Prop({ required: true, trim: true })
  sectionNumber: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, min: 0 })
  wordCount: number;

  @Prop({ required: true, min: 1 })
  order: number;
}

export const ContentSubsectionSchema =
  SchemaFactory.createForClass(ContentSubsection);

@Schema({ _id: false })
export class ContentSection {
  @Prop({ required: true, trim: true })
  sectionNumber: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, min: 0 })
  wordCount: number;

  @Prop({ type: [ContentSubsectionSchema], default: [] })
  subsections: ContentSubsection[];

  @Prop({ required: true, min: 1 })
  order: number;
}

export const ContentSectionSchema = SchemaFactory.createForClass(ContentSection);
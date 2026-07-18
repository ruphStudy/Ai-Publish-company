import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ContentSection} from './content-section.entity';
import {
  ContentSectionSchema,
} from './content-section.entity';

@Schema({ _id: false })
export class ChapterContent {
  @Prop({ required: true, min: 1 })
  chapterNumber: number;

  @Prop({ required: true, trim: true })
  chapterTitle: string;

  @Prop({ required: true })
  introduction: string;

  @Prop({ required: true })
  conclusion: string;

  @Prop({ type: [ContentSectionSchema], default: [] })
  sections: ContentSection[];
}

export const ChapterContentSchema =
  SchemaFactory.createForClass(ChapterContent);
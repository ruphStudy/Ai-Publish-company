import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class TableOfContentsItem {
  @Prop({ required: true, min: 1, max: 4 })
  level: number;

  @Prop({ required: true, trim: true })
  number: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  parentId?: string;

  @Prop({ required: true, min: 1 })
  pageNumber: number;

  @Prop({ required: true, min: 1 })
  order: number;

  @Prop({ type: [Object], default: [] })
  children: TableOfContentsItem[];

  @Prop({ required: true, trim: true })
  anchorId: string;
}

export const TableOfContentsItemSchema =
  SchemaFactory.createForClass(TableOfContentsItem);
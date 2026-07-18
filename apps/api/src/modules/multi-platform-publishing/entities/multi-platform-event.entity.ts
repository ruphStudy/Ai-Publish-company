import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MultiPlatformEventType } from './multi-platform-publishing.entity';

export type MultiPlatformEventDocument = HydratedDocument<MultiPlatformEvent>;
@Schema({ collection: 'multi_platform_publishing_events', timestamps: true, versionKey: 'version' })
export class MultiPlatformEvent {
  @Prop({ required: true, unique: true, index: true }) eventId: string;
  @Prop({ required: true, index: true }) orchestrationId: string;
  @Prop({ type: String, default: null, index: true }) targetId: string | null;
  @Prop({ type: String, enum: MultiPlatformEventType, required: true }) eventType: MultiPlatformEventType;
  @Prop({ required: true }) message: string;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: String, default: null }) createdBy: string | null;
}
export const MultiPlatformEventSchema = SchemaFactory.createForClass(MultiPlatformEvent);
MultiPlatformEventSchema.index({ orchestrationId: 1, createdAt: -1 });

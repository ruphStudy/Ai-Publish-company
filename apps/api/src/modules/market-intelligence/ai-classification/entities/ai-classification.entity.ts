import { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import {
  ClassificationCompetitionLevel,
  ClassificationComplexity,
  ClassificationContentType,
  ClassificationDemandLevel,
  ClassificationMarketMaturity,
  ClassificationTopicType,
  ClassificationWritingStyle,
} from '../models/classification-result.model';

@Schema({ timestamps: true, collection: 'ai_classifications' })
export class AIClassification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'MarketKnowledge', required: true, unique: true })
  knowledgeId: Types.ObjectId;

  @Prop({ type: String, trim: true, maxlength: 200, default: null, index: true })
  primaryCategory: string | null;

  @Prop({ type: String, trim: true, maxlength: 200, default: null })
  secondaryCategory: string | null;

  @Prop({ type: String, trim: true, maxlength: 300, default: null, index: true })
  niche: string | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  microNiche: string | null;

  @Prop({ type: String, trim: true, maxlength: 300, default: null })
  targetAudience: string | null;

  @Prop({ type: String, enum: ClassificationContentType, required: true, index: true })
  contentType: ClassificationContentType;

  @Prop({ type: String, enum: ClassificationWritingStyle, required: true })
  writingStyle: ClassificationWritingStyle;

  @Prop({ type: String, enum: ClassificationComplexity, required: true })
  complexity: ClassificationComplexity;

  @Prop({ type: String, enum: ClassificationDemandLevel, required: true, index: true })
  demandLevel: ClassificationDemandLevel;

  @Prop({ type: String, enum: ClassificationCompetitionLevel, required: true, index: true })
  competitionLevel: ClassificationCompetitionLevel;

  @Prop({ type: String, enum: ClassificationMarketMaturity, required: true, index: true })
  marketMaturity: ClassificationMarketMaturity;

  @Prop({ type: String, enum: ClassificationTopicType, required: true, index: true })
  topicType: ClassificationTopicType;

  @Prop({ required: true, default: false })
  commercialIntent: boolean;

  @Prop({ required: true, default: false })
  educationalIntent: boolean;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  evergreenScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  seasonalScore: number;

  @Prop({ type: [String], default: [], index: true })
  aiTags: string[];

  @Prop({ type: Number, required: true, min: 0, max: 100, index: true })
  confidenceScore: number;

  @Prop({ required: true, trim: true, maxlength: 50, index: true })
  classificationVersion: string;

  @Prop({ type: Date, required: true, index: true })
  classifiedAt: Date;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const AIClassificationSchema = SchemaFactory.createForClass(AIClassification);

AIClassificationSchema.index({ knowledgeId: 1 }, { unique: true });
AIClassificationSchema.index({ primaryCategory: 1, niche: 1, isDeleted: 1 });
AIClassificationSchema.index({ demandLevel: 1, competitionLevel: 1, isDeleted: 1 });
AIClassificationSchema.index({ confidenceScore: -1, isDeleted: 1 });
AIClassificationSchema.index({ classifiedAt: -1, isDeleted: 1 });
AIClassificationSchema.index({ classificationVersion: 1, isDeleted: 1 });

AIClassificationSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {

  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

  next();
});
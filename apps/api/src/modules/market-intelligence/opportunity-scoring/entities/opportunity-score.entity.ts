import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import {
  OpportunityGrade,
  OpportunityRecommendation,
} from '../models/opportunity-score.model';

@Schema({ timestamps: true, collection: 'opportunity_scores' })
export class OpportunityScore extends Document {
  @Prop({ type: Types.ObjectId, ref: 'MarketKnowledge', required: true, unique: true })
  knowledgeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AIClassification', required: true, index: true })
  classificationId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0, max: 100, index: true })
  overallScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  demandScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  competitionScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  trendScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  growthScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  qualityScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  profitabilityScore: number;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  confidenceScore: number;

  @Prop({ type: String, enum: OpportunityGrade, required: true, index: true })
  opportunityGrade: OpportunityGrade;

  @Prop({
    type: String,
    enum: OpportunityRecommendation,
    required: true,
    index: true,
  })
  recommendation: OpportunityRecommendation;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  recommendationReason: string;

  @Prop({ required: true, trim: true, maxlength: 50, index: true })
  scoreVersion: string;

  @Prop({ type: Date, required: true, index: true })
  scoredAt: Date;

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

export const OpportunityScoreSchema = SchemaFactory.createForClass(OpportunityScore);

OpportunityScoreSchema.index({ knowledgeId: 1 }, { unique: true });
OpportunityScoreSchema.index({ overallScore: -1, isDeleted: 1 });
OpportunityScoreSchema.index({ opportunityGrade: 1, recommendation: 1, isDeleted: 1 });
OpportunityScoreSchema.index({ confidenceScore: -1, isDeleted: 1 });
OpportunityScoreSchema.index({ scoredAt: -1, isDeleted: 1 });
OpportunityScoreSchema.index({ scoreVersion: 1, isDeleted: 1 });

OpportunityScoreSchema.pre(/^find/, function (next) {
  const query = this as any;

  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }

  next();
});
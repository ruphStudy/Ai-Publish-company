import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InsightRefreshMode, InsightRefreshStatus, InsightScope } from './ai-insight.entity';

export type InsightRefreshDocument = HydratedDocument<InsightRefresh>;

@Schema({ collection: 'ai_insight_refreshes', timestamps: true, versionKey: 'version' })
export class InsightRefresh {
  @Prop({ required: true, unique: true, index: true }) refreshId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: InsightScope, required: true, index: true }) scope: InsightScope;
  @Prop({ type: [String], default: [] }) entityIds: string[];
  @Prop({ type: String, enum: InsightRefreshMode, required: true, index: true }) mode: InsightRefreshMode;
  @Prop({ type: String, enum: InsightRefreshStatus, required: true, index: true }) status: InsightRefreshStatus;
  @Prop({ required: true, unique: true, index: true }) idempotencyKey: string;
  @Prop({ type: Date, required: true }) startedAt: Date;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ default: 0 }) insightsGenerated: number;
  @Prop({ default: 0 }) errorCount: number;
  @Prop({ default: 0 }) retryCount: number;
  @Prop({ default: 3 }) maximumRetries: number;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const InsightRefreshSchema = SchemaFactory.createForClass(InsightRefresh);
InsightRefreshSchema.index({ projectId: 1, scope: 1, status: 1, isDeleted: 1 });
InsightRefreshSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });

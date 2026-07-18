import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InsightRefreshStatus, InsightScope } from './ai-insight.entity';

export type InsightSnapshotDocument = HydratedDocument<InsightSnapshot>;

@Schema({ collection: 'ai_insight_snapshots', timestamps: true, versionKey: 'version' })
export class InsightSnapshot {
  @Prop({ required: true, unique: true, index: true }) snapshotId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: InsightScope, required: true, index: true }) scope: InsightScope;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ type: [String], default: [] }) insightIds: string[];
  @Prop({ type: Object, default: {} }) executiveSummary: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) categorySummaries: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) prioritySummaries: Record<string, unknown>;
  @Prop({ type: Date, required: true, index: true }) generatedAt: Date;
  @Prop({ type: String, enum: InsightRefreshStatus, required: true, index: true }) status: InsightRefreshStatus;
  @Prop({ required: true, unique: true, index: true }) fingerprint: string;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const InsightSnapshotSchema = SchemaFactory.createForClass(InsightSnapshot);
InsightSnapshotSchema.index({ projectId: 1, scope: 1, entityId: 1, generatedAt: -1, isDeleted: 1 });
InsightSnapshotSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });

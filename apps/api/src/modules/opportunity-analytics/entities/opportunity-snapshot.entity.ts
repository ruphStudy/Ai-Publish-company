import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OpportunityRefreshStatus, OpportunityScope } from './opportunity-analytics.entity';

export type OpportunitySnapshotDocument = HydratedDocument<OpportunitySnapshot>;

@Schema({ collection: 'opportunity_snapshots', timestamps: true, versionKey: 'version' })
export class OpportunitySnapshot {
  @Prop({ required: true, unique: true, index: true }) snapshotId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: OpportunityScope, required: true, index: true }) scope: OpportunityScope;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ type: Date, required: true }) analysisPeriodStart: Date;
  @Prop({ type: Date, required: true }) analysisPeriodEnd: Date;
  @Prop({ type: [Object], default: [] }) comparisonPeriods: Record<string, unknown>[];
  @Prop({ type: [String], default: [] }) opportunityIds: string[];
  @Prop({ type: [String], default: [] }) rankedOpportunityIds: string[];
  @Prop({ type: Object, default: {} }) categorySummaries: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) prioritySummaries: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) providerSummaries: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) marketplaceSummaries: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) countrySummaries: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) formatSummaries: Record<string, unknown>;
  @Prop({ type: Object, default: null }) totalEstimatedImpact: Record<string, unknown> | null;
  @Prop({ type: Object, default: {} }) dataCompleteness: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) dataFreshness: Record<string, unknown>;
  @Prop({ required: true }) ruleSetVersion: string;
  @Prop({ required: true }) scoringProfileVersion: string;
  @Prop({ type: [String], default: [] }) sourceAnalyticsSnapshotIds: string[];
  @Prop({ type: Date, required: true, index: true }) generatedAt: Date;
  @Prop({ type: String, enum: OpportunityRefreshStatus, required: true, index: true }) status: OpportunityRefreshStatus;
  @Prop({ type: String, default: null }) supersedesSnapshotId: string | null;
  @Prop({ type: String, default: null }) supersededBySnapshotId: string | null;
  @Prop({ required: true, unique: true, index: true }) fingerprint: string;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const OpportunitySnapshotSchema = SchemaFactory.createForClass(OpportunitySnapshot);
OpportunitySnapshotSchema.index({ projectId: 1, scope: 1, entityId: 1, generatedAt: -1, isDeleted: 1 });
OpportunitySnapshotSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });

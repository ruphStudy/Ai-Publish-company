import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OpportunityRefreshMode, OpportunityRefreshStatus, OpportunityScope } from './opportunity-analytics.entity';

export type OpportunityRefreshDocument = HydratedDocument<OpportunityRefresh>;

@Schema({ collection: 'opportunity_refreshes', timestamps: true, versionKey: 'version' })
export class OpportunityRefresh {
  @Prop({ required: true, unique: true, index: true }) refreshId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: OpportunityScope, required: true, index: true }) scope: OpportunityScope;
  @Prop({ type: [String], default: [], index: true }) entityIds: string[];
  @Prop({ type: String, enum: OpportunityRefreshMode, required: true, index: true }) mode: OpportunityRefreshMode;
  @Prop({ type: String, enum: OpportunityRefreshStatus, required: true, index: true }) status: OpportunityRefreshStatus;
  @Prop({ type: Object, required: true }) analysisPeriod: Record<string, unknown>;
  @Prop({ type: [Object], default: [] }) comparisonPeriods: Record<string, unknown>[];
  @Prop({ type: [String], default: [] }) ruleKeys: string[];
  @Prop({ required: true }) ruleSetVersion: string;
  @Prop({ required: true }) scoringProfileVersion: string;
  @Prop({ required: true, unique: true, index: true }) idempotencyKey: string;
  @Prop({ type: Object, default: {} }) sourceCheckpointStart: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) sourceCheckpointEnd: Record<string, unknown>;
  @Prop({ default: 0 }) entitiesProcessed: number;
  @Prop({ default: 0 }) rulesEvaluated: number;
  @Prop({ default: 0 }) opportunitiesDetected: number;
  @Prop({ default: 0 }) opportunitiesUpdated: number;
  @Prop({ default: 0 }) opportunitiesSuperseded: number;
  @Prop({ default: 0 }) opportunitiesInvalidated: number;
  @Prop({ default: 0 }) duplicatesSuppressed: number;
  @Prop({ default: 0 }) conflictsDetected: number;
  @Prop({ default: 0 }) warningCount: number;
  @Prop({ default: 0 }) errorCount: number;
  @Prop({ default: 0 }) retryCount: number;
  @Prop({ default: 0 }) maximumRetries: number;
  @Prop({ type: Date, required: true }) startedAt: Date;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ type: String, default: null }) rebuildReason: string | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const OpportunityRefreshSchema = SchemaFactory.createForClass(OpportunityRefresh);
OpportunityRefreshSchema.index({ projectId: 1, scope: 1, status: 1, isDeleted: 1 });
OpportunityRefreshSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });

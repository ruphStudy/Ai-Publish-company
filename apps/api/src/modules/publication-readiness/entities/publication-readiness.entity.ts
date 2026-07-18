import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ReadinessScope { MANUSCRIPT = 'MANUSCRIPT', BOOK = 'BOOK' }
export enum ReadinessTargetType { MANUSCRIPT = 'MANUSCRIPT', BOOK = 'BOOK' }
export enum PublicationDecision { READY = 'READY', READY_WITH_WARNINGS = 'READY_WITH_WARNINGS', NOT_READY = 'NOT_READY', BLOCKED = 'BLOCKED' }
export enum PublicationReadinessStatus { PENDING = 'PENDING', PROCESSING = 'PROCESSING', COMPLETED = 'COMPLETED', APPROVED = 'APPROVED', REJECTED = 'REJECTED', FAILED = 'FAILED', SUPERSEDED = 'SUPERSEDED' }
export enum ReadinessRiskLevel { NONE = 'NONE', LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum ReadinessGateType { QUALITY = 'QUALITY', ORIGINALITY = 'ORIGINALITY', FACT_CONSISTENCY = 'FACT_CONSISTENCY', COMPLIANCE = 'COMPLIANCE', METADATA = 'METADATA', STRUCTURE = 'STRUCTURE', CONTENT_IMPROVEMENT = 'CONTENT_IMPROVEMENT', EXPORT = 'EXPORT', MANUAL_APPROVAL = 'MANUAL_APPROVAL' }
export enum ReadinessPolicyProfile { DEFAULT = 'DEFAULT', EBOOK = 'EBOOK', PRINT = 'PRINT', BOTH = 'BOTH', CUSTOM = 'CUSTOM' }
export enum ManualApprovalStatus { NOT_REQUIRED = 'NOT_REQUIRED', REQUIRED = 'REQUIRED', APPROVED = 'APPROVED', REJECTED = 'REJECTED', REVOKED = 'REVOKED' }

@Schema({ _id: false })
export class PublicationGateResult {
  @Prop({ type: String, enum: ReadinessGateType, required: true }) gateType: ReadinessGateType;
  @Prop({ required: true }) required: boolean;
  @Prop({ required: true, min: 0, max: 1 }) weight: number;
  @Prop({ type: String, default: null }) sourceResultId: string | null;
  @Prop({ type: String, default: null }) sourceResultVersion: string | null;
  @Prop({ required: true, min: 0, max: 100 }) score: number;
  @Prop({ required: true, min: 0, max: 100 }) minimumScore: number;
  @Prop({ required: true }) passed: boolean;
  @Prop({ required: true }) conditional: boolean;
  @Prop({ required: true, min: 0 }) blockerCount: number;
  @Prop({ required: true, min: 0 }) warningCount: number;
  @Prop({ type: String, enum: ReadinessRiskLevel, required: true }) riskLevel: ReadinessRiskLevel;
  @Prop({ type: [String], default: [] }) reasons: string[];
  @Prop({ type: [String], default: [] }) recommendations: string[];
}
export const PublicationGateResultSchema = SchemaFactory.createForClass(PublicationGateResult);

export type PublicationReadinessDocument = HydratedDocument<PublicationReadiness>;

@Schema({ collection: 'publication_readiness_assessments', timestamps: true, versionKey: 'version' })
export class PublicationReadiness {
  @Prop({ required: true, unique: true, index: true }) assessmentId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ type: String, enum: ReadinessTargetType, required: true, index: true }) targetType: ReadinessTargetType;
  @Prop({ required: true, index: true }) targetId: string;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: ReadinessScope, required: true }) scope: ReadinessScope;
  @Prop({ type: String, enum: ReadinessPolicyProfile, required: true, index: true }) policyProfile: ReadinessPolicyProfile;
  @Prop({ required: true, index: true }) policyVersion: string;
  @Prop({ type: Object, default: {} }) sourceResultIds: Record<string, string>;
  @Prop({ type: Object, default: {} }) sourceResultVersions: Record<string, string>;
  @Prop({ required: true, min: 0, max: 100 }) overallScore: number;
  @Prop({ required: true, min: 0, max: 100 }) qualityGateScore: number;
  @Prop({ required: true, min: 0, max: 100 }) originalityGateScore: number;
  @Prop({ required: true, min: 0, max: 100 }) factConsistencyGateScore: number;
  @Prop({ required: true, min: 0, max: 100 }) complianceGateScore: number;
  @Prop({ required: true, min: 0, max: 100 }) metadataGateScore: number;
  @Prop({ required: true, min: 0, max: 100 }) structureGateScore: number;
  @Prop({ required: true, min: 0, max: 100 }) exportGateScore: number;
  @Prop({ type: String, enum: ReadinessRiskLevel, required: true, index: true }) riskLevel: ReadinessRiskLevel;
  @Prop({ type: String, enum: PublicationDecision, required: true, index: true }) finalDecision: PublicationDecision;
  @Prop({ type: [PublicationGateResultSchema], default: [] }) passedGates: PublicationGateResult[];
  @Prop({ type: [PublicationGateResultSchema], default: [] }) failedGates: PublicationGateResult[];
  @Prop({ type: [PublicationGateResultSchema], default: [] }) conditionalGates: PublicationGateResult[];
  @Prop({ type: [String], default: [] }) blockers: string[];
  @Prop({ type: [String], default: [] }) warnings: string[];
  @Prop({ type: [String], default: [] }) recommendations: string[];
  @Prop({ type: [String], default: [] }) missingRequirements: string[];
  @Prop({ required: true }) manualApprovalRequired: boolean;
  @Prop({ type: String, enum: ManualApprovalStatus, required: true }) manualApprovalStatus: ManualApprovalStatus;
  @Prop({ type: Date, default: null }) readyAt: Date | null;
  @Prop({ type: Date, default: null }) approvedAt: Date | null;
  @Prop({ type: String, default: null }) approvedBy: string | null;
  @Prop({ type: Date, default: null }) rejectedAt: Date | null;
  @Prop({ type: String, default: null }) rejectedBy: string | null;
  @Prop({ type: String, default: null }) rejectionReason: string | null;
  @Prop({ type: String, enum: PublicationReadinessStatus, required: true, index: true }) status: PublicationReadinessStatus;
  @Prop({ required: true, min: 1, index: true }) readinessVersion: number;
  @Prop({ default: false, index: true }) isSuperseded: boolean;
  @Prop({ type: String, default: null }) supersededBy: string | null;
  @Prop({ type: String, default: null }) failureCode: string | null;
  @Prop({ type: String, default: null }) failureMessage: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const PublicationReadinessSchema = SchemaFactory.createForClass(PublicationReadiness);
PublicationReadinessSchema.index({ projectId: 1, createdAt: -1 });
PublicationReadinessSchema.index({ targetType: 1, targetId: 1, manuscriptVersion: 1, policyVersion: 1, isSuperseded: 1 });
PublicationReadinessSchema.index({ projectId: 1, manuscriptVersion: 1, policyProfile: 1, status: 1, isDeleted: 1 });
PublicationReadinessSchema.index({ finalDecision: 1, riskLevel: 1, isSuperseded: 1, isDeleted: 1 });
PublicationReadinessSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });

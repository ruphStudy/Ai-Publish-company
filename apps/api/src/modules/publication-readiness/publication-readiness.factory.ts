import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { ReadinessPolicy } from './config/publication-readiness.config';
import { ManualApprovalStatus, PublicationDecision, PublicationReadiness, PublicationReadinessStatus, ReadinessScope, ReadinessTargetType } from './entities/publication-readiness.entity';
import type { PublicationReadinessEvaluation } from './publication-readiness.engine';

@Injectable()
export class PublicationReadinessFactory {
  create(input: { projectId: string; targetType: ReadinessTargetType; targetId: string; manuscriptVersion: string; scope: ReadinessScope; readinessVersion: number; createdBy?: string }, policy: ReadinessPolicy, result: PublicationReadinessEvaluation): Partial<PublicationReadiness> {
    const passedGates = result.gates.filter((gate) => gate.passed && !gate.conditional);
    const failedGates = result.gates.filter((gate) => !gate.passed);
    const conditionalGates = result.gates.filter((gate) => gate.conditional);
    return { assessmentId: `PRA-${randomUUID()}`, ...input, policyProfile: policy.profile, policyVersion: policy.policyVersion, sourceResultIds: result.sourceResultIds, sourceResultVersions: result.sourceResultVersions, overallScore: result.overallScore, qualityGateScore: result.gates.find((gate) => gate.gateType === 'QUALITY')?.score ?? 0, originalityGateScore: result.gates.find((gate) => gate.gateType === 'ORIGINALITY')?.score ?? 0, factConsistencyGateScore: result.gates.find((gate) => gate.gateType === 'FACT_CONSISTENCY')?.score ?? 0, complianceGateScore: result.gates.find((gate) => gate.gateType === 'COMPLIANCE')?.score ?? 0, metadataGateScore: result.gates.find((gate) => gate.gateType === 'METADATA')?.score ?? 0, structureGateScore: result.gates.find((gate) => gate.gateType === 'STRUCTURE')?.score ?? 0, exportGateScore: result.gates.find((gate) => gate.gateType === 'EXPORT')?.score ?? 0, riskLevel: result.riskLevel, finalDecision: result.finalDecision, passedGates, failedGates, conditionalGates, blockers: result.blockers, warnings: result.warnings, recommendations: result.recommendations, missingRequirements: result.missingRequirements, manualApprovalRequired: policy.manualApprovalMandatory, manualApprovalStatus: policy.manualApprovalMandatory ? ManualApprovalStatus.REQUIRED : ManualApprovalStatus.NOT_REQUIRED, readyAt: [PublicationDecision.READY, PublicationDecision.READY_WITH_WARNINGS].includes(result.finalDecision) ? new Date() : null, approvedAt: null, approvedBy: null, rejectedAt: null, rejectedBy: null, rejectionReason: null, status: PublicationReadinessStatus.COMPLETED, isSuperseded: false, supersededBy: null, failureCode: null, failureMessage: null, isDeleted: false, createdBy: input.createdBy ?? null, updatedBy: input.createdBy ?? null };
  }
}

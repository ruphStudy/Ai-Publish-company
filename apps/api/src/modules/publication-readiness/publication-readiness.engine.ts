import { BadRequestException, Injectable } from '@nestjs/common';
import type { ReadinessPolicy } from './config/publication-readiness.config';
import { PublicationDecision, PublicationGateResult, ReadinessGateType, ReadinessRiskLevel } from './entities/publication-readiness.entity';
import type { GateEvaluationInput, ReadinessSources } from './interfaces/publication-readiness.interface';

export interface PublicationReadinessEvaluation { gates: PublicationGateResult[]; overallScore: number; riskLevel: ReadinessRiskLevel; finalDecision: PublicationDecision; blockers: string[]; warnings: string[]; recommendations: string[]; missingRequirements: string[]; sourceResultIds: Record<string, string>; sourceResultVersions: Record<string, string> }

@Injectable()
export class PublicationReadinessEngine {
  evaluate(sources: ReadinessSources, policy: ReadinessPolicy): PublicationReadinessEvaluation {
    this.validatePolicy(policy);
    const gateTypes = Object.values(ReadinessGateType);
    const gates = gateTypes.map((gateType) => this.evaluateGate({ gateType, source: sources[gateType] }, policy));
    const weightTotal = gates.reduce((total, gate) => total + gate.weight, 0) || 1;
    const overallScore = this.clamp(Math.round(gates.reduce((total, gate) => total + gate.score * gate.weight, 0) / weightTotal));
    const blockers = gates.flatMap((gate) => gate.blockerCount > 0 ? gate.reasons : []);
    const warnings = gates.flatMap((gate) => gate.warningCount > 0 ? gate.reasons : []);
    const recommendations = [...new Set(gates.flatMap((gate) => gate.recommendations))];
    const missingRequirements = gates.filter((gate) => gate.required && !gate.sourceResultId).map((gate) => `${gate.gateType} source result is required`);
    const riskLevel = this.risk(gates);
    const mandatoryFailed = gates.some((gate) => gate.required && !gate.passed);
    const critical = riskLevel === ReadinessRiskLevel.CRITICAL || blockers.length > 0;
    const finalDecision = critical ? PublicationDecision.BLOCKED : mandatoryFailed || overallScore < policy.minimumOverallScore ? PublicationDecision.NOT_READY : warnings.length > 0 || gates.some((gate) => gate.conditional) ? PublicationDecision.READY_WITH_WARNINGS : PublicationDecision.READY;
    const sourceResultIds = Object.fromEntries(gates.filter((gate) => gate.sourceResultId).map((gate) => [gate.gateType, gate.sourceResultId as string]));
    const sourceResultVersions = Object.fromEntries(gates.filter((gate) => gate.sourceResultVersion).map((gate) => [gate.gateType, gate.sourceResultVersion as string]));
    return { gates, overallScore, riskLevel, finalDecision, blockers, warnings, recommendations, missingRequirements, sourceResultIds, sourceResultVersions };
  }
  private evaluateGate(input: GateEvaluationInput, policy: ReadinessPolicy): PublicationGateResult {
    const required = policy.requiredSourceEngines.includes(input.gateType);
    const weight = policy.gateWeights[input.gateType] ?? 0;
    const minimumScore = policy.minimumGateScores[input.gateType] ?? 0;
    if (!input.source) return { gateType: input.gateType, required, weight, sourceResultId: null, sourceResultVersion: null, score: 0, minimumScore, passed: !required, conditional: !required && policy.missingOptionalEnginesProduceWarnings, blockerCount: required ? 1 : 0, warningCount: required ? 0 : 1, riskLevel: required ? ReadinessRiskLevel.CRITICAL : ReadinessRiskLevel.LOW, reasons: [`${input.gateType} source result is missing`], recommendations: [`Run ${input.gateType} validation before readiness assessment`] };
    const completed = policy.requiredCompletedStatuses.includes(input.source.status);
    const passed = completed && input.source.score >= minimumScore && input.source.blockerCount === 0;
    const requiredBlockers = required && !completed ? 1 : 0;
    const criticalBlockers = input.source.riskLevel === ReadinessRiskLevel.CRITICAL ? 1 : 0;
    return { gateType: input.gateType, required, weight, sourceResultId: input.source.id, sourceResultVersion: input.source.version, score: this.clamp(input.source.score), minimumScore, passed: passed && criticalBlockers === 0, conditional: passed && input.source.warningCount > 0, blockerCount: input.source.blockerCount + requiredBlockers + criticalBlockers, warningCount: input.source.warningCount, riskLevel: input.source.riskLevel, reasons: input.source.reasons, recommendations: input.source.recommendations };
  }
  private validatePolicy(policy: ReadinessPolicy): void { const total = Object.values(policy.gateWeights).reduce((sum, weight) => sum + weight, 0); if (total <= 0 || Object.values(policy.gateWeights).some((weight) => weight < 0)) throw new BadRequestException('Invalid publication readiness policy weights'); }
  private risk(gates: PublicationGateResult[]): ReadinessRiskLevel { if (gates.some((gate) => gate.riskLevel === ReadinessRiskLevel.CRITICAL)) return ReadinessRiskLevel.CRITICAL; if (gates.some((gate) => gate.riskLevel === ReadinessRiskLevel.HIGH)) return ReadinessRiskLevel.HIGH; if (gates.some((gate) => gate.riskLevel === ReadinessRiskLevel.MEDIUM)) return ReadinessRiskLevel.MEDIUM; if (gates.some((gate) => gate.riskLevel === ReadinessRiskLevel.LOW)) return ReadinessRiskLevel.LOW; return ReadinessRiskLevel.NONE; }
  private clamp(value: number): number { return Math.max(0, Math.min(100, value)); }
}

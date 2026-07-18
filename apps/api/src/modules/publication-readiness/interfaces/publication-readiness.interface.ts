import type { ReadinessGateType, ReadinessRiskLevel } from '../entities/publication-readiness.entity';

export interface ReadinessSourceRecord {
  id: string;
  version: string;
  status: string;
  score: number;
  riskLevel: ReadinessRiskLevel;
  blockerCount: number;
  warningCount: number;
  reasons: string[];
  recommendations: string[];
  manuscriptVersion?: string;
}

export type ReadinessSources = Partial<Record<ReadinessGateType, ReadinessSourceRecord>>;

export interface GateEvaluationInput {
  gateType: ReadinessGateType;
  source?: ReadinessSourceRecord;
}

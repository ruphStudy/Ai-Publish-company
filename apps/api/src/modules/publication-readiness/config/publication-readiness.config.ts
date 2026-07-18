import { ReadinessGateType, ReadinessPolicyProfile } from '../entities/publication-readiness.entity';

export interface ReadinessPolicy {
  profile: ReadinessPolicyProfile;
  policyVersion: string;
  gateWeights: Record<ReadinessGateType, number>;
  minimumOverallScore: number;
  minimumGateScores: Record<ReadinessGateType, number>;
  requiredSourceEngines: ReadinessGateType[];
  requiredCompletedStatuses: string[];
  requiredApprovalStatuses: string[];
  blockingSeverities: string[];
  allowedWarningCount: number;
  maximumHighRiskIssueCount: number;
  maximumCriticalRiskIssueCount: number;
  approvedContentImprovementsMustBeApplied: boolean;
  manualApprovalMandatory: boolean;
  exportPrerequisitesMandatory: boolean;
  missingOptionalEnginesProduceWarnings: boolean;
  platformProfile: string;
  bookTypeProfile: string;
  languageProfile: string;
}

const weights: Record<ReadinessGateType, number> = {
  QUALITY: 0.18,
  ORIGINALITY: 0.16,
  FACT_CONSISTENCY: 0.16,
  COMPLIANCE: 0.18,
  METADATA: 0.1,
  STRUCTURE: 0.08,
  CONTENT_IMPROVEMENT: 0.06,
  EXPORT: 0.06,
  MANUAL_APPROVAL: 0.02,
};

export const publicationReadinessPolicies: Record<ReadinessPolicyProfile, ReadinessPolicy> = {
  DEFAULT: { profile: ReadinessPolicyProfile.DEFAULT, policyVersion: 'readiness-default-v1', gateWeights: weights, minimumOverallScore: 80, minimumGateScores: { QUALITY: 75, ORIGINALITY: 75, FACT_CONSISTENCY: 75, COMPLIANCE: 75, METADATA: 70, STRUCTURE: 70, CONTENT_IMPROVEMENT: 0, EXPORT: 60, MANUAL_APPROVAL: 100 }, requiredSourceEngines: [ReadinessGateType.QUALITY, ReadinessGateType.ORIGINALITY, ReadinessGateType.FACT_CONSISTENCY, ReadinessGateType.COMPLIANCE, ReadinessGateType.METADATA, ReadinessGateType.STRUCTURE], requiredCompletedStatuses: ['COMPLETED', 'APPROVED', 'APPLIED'], requiredApprovalStatuses: ['APPROVED', 'APPLIED'], blockingSeverities: ['CRITICAL'], allowedWarningCount: 8, maximumHighRiskIssueCount: 3, maximumCriticalRiskIssueCount: 0, approvedContentImprovementsMustBeApplied: false, manualApprovalMandatory: false, exportPrerequisitesMandatory: false, missingOptionalEnginesProduceWarnings: true, platformProfile: 'DEFAULT', bookTypeProfile: 'DEFAULT', languageProfile: 'en' },
  EBOOK: { profile: ReadinessPolicyProfile.EBOOK, policyVersion: 'readiness-ebook-v1', gateWeights: { ...weights, EXPORT: 0.08, STRUCTURE: 0.1, MANUAL_APPROVAL: 0 }, minimumOverallScore: 82, minimumGateScores: { QUALITY: 75, ORIGINALITY: 75, FACT_CONSISTENCY: 75, COMPLIANCE: 78, METADATA: 70, STRUCTURE: 75, CONTENT_IMPROVEMENT: 0, EXPORT: 70, MANUAL_APPROVAL: 100 }, requiredSourceEngines: [ReadinessGateType.QUALITY, ReadinessGateType.ORIGINALITY, ReadinessGateType.FACT_CONSISTENCY, ReadinessGateType.COMPLIANCE, ReadinessGateType.METADATA, ReadinessGateType.STRUCTURE], requiredCompletedStatuses: ['COMPLETED', 'APPROVED', 'APPLIED'], requiredApprovalStatuses: ['APPROVED', 'APPLIED'], blockingSeverities: ['CRITICAL'], allowedWarningCount: 8, maximumHighRiskIssueCount: 2, maximumCriticalRiskIssueCount: 0, approvedContentImprovementsMustBeApplied: false, manualApprovalMandatory: false, exportPrerequisitesMandatory: false, missingOptionalEnginesProduceWarnings: true, platformProfile: 'EBOOK', bookTypeProfile: 'EBOOK', languageProfile: 'en' },
  PRINT: { profile: ReadinessPolicyProfile.PRINT, policyVersion: 'readiness-print-v1', gateWeights: { ...weights, EXPORT: 0.1, COMPLIANCE: 0.2, MANUAL_APPROVAL: 0 }, minimumOverallScore: 84, minimumGateScores: { QUALITY: 76, ORIGINALITY: 76, FACT_CONSISTENCY: 76, COMPLIANCE: 82, METADATA: 72, STRUCTURE: 78, CONTENT_IMPROVEMENT: 0, EXPORT: 75, MANUAL_APPROVAL: 100 }, requiredSourceEngines: [ReadinessGateType.QUALITY, ReadinessGateType.ORIGINALITY, ReadinessGateType.FACT_CONSISTENCY, ReadinessGateType.COMPLIANCE, ReadinessGateType.METADATA, ReadinessGateType.STRUCTURE, ReadinessGateType.EXPORT], requiredCompletedStatuses: ['COMPLETED', 'APPROVED', 'APPLIED'], requiredApprovalStatuses: ['APPROVED', 'APPLIED'], blockingSeverities: ['CRITICAL'], allowedWarningCount: 6, maximumHighRiskIssueCount: 2, maximumCriticalRiskIssueCount: 0, approvedContentImprovementsMustBeApplied: false, manualApprovalMandatory: false, exportPrerequisitesMandatory: true, missingOptionalEnginesProduceWarnings: true, platformProfile: 'PRINT', bookTypeProfile: 'PRINT', languageProfile: 'en' },
  BOTH: { profile: ReadinessPolicyProfile.BOTH, policyVersion: 'readiness-both-v1', gateWeights: weights, minimumOverallScore: 84, minimumGateScores: { QUALITY: 76, ORIGINALITY: 76, FACT_CONSISTENCY: 76, COMPLIANCE: 82, METADATA: 72, STRUCTURE: 78, CONTENT_IMPROVEMENT: 0, EXPORT: 75, MANUAL_APPROVAL: 100 }, requiredSourceEngines: [ReadinessGateType.QUALITY, ReadinessGateType.ORIGINALITY, ReadinessGateType.FACT_CONSISTENCY, ReadinessGateType.COMPLIANCE, ReadinessGateType.METADATA, ReadinessGateType.STRUCTURE, ReadinessGateType.EXPORT], requiredCompletedStatuses: ['COMPLETED', 'APPROVED', 'APPLIED'], requiredApprovalStatuses: ['APPROVED', 'APPLIED'], blockingSeverities: ['CRITICAL'], allowedWarningCount: 6, maximumHighRiskIssueCount: 2, maximumCriticalRiskIssueCount: 0, approvedContentImprovementsMustBeApplied: false, manualApprovalMandatory: false, exportPrerequisitesMandatory: true, missingOptionalEnginesProduceWarnings: true, platformProfile: 'BOTH', bookTypeProfile: 'BOTH', languageProfile: 'en' },
  CUSTOM: { profile: ReadinessPolicyProfile.CUSTOM, policyVersion: 'readiness-custom-v1', gateWeights: weights, minimumOverallScore: 80, minimumGateScores: { QUALITY: 75, ORIGINALITY: 75, FACT_CONSISTENCY: 75, COMPLIANCE: 75, METADATA: 70, STRUCTURE: 70, CONTENT_IMPROVEMENT: 0, EXPORT: 60, MANUAL_APPROVAL: 100 }, requiredSourceEngines: [ReadinessGateType.QUALITY, ReadinessGateType.ORIGINALITY, ReadinessGateType.FACT_CONSISTENCY, ReadinessGateType.COMPLIANCE], requiredCompletedStatuses: ['COMPLETED', 'APPROVED', 'APPLIED'], requiredApprovalStatuses: ['APPROVED', 'APPLIED'], blockingSeverities: ['CRITICAL'], allowedWarningCount: 10, maximumHighRiskIssueCount: 3, maximumCriticalRiskIssueCount: 0, approvedContentImprovementsMustBeApplied: false, manualApprovalMandatory: false, exportPrerequisitesMandatory: false, missingOptionalEnginesProduceWarnings: true, platformProfile: 'CUSTOM', bookTypeProfile: 'CUSTOM', languageProfile: 'en' },
};

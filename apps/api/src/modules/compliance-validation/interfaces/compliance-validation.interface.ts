import type { ComplianceCategory, ComplianceCheck, ComplianceIssueSeverity } from '../entities/compliance-validation.entity';

export interface ComplianceContentSegment { location: string; text: string; chapterId?: string; sectionId?: string }
export interface ComplianceValidationInput { content: string; markdownContent: string; htmlContent: string; plainTextContent: string; segments: ComplianceContentSegment[]; metadata: Record<string, unknown>; toc: Record<string, unknown> | null; manuscriptVersion: string }
export interface ComplianceRuleResult { category: ComplianceCategory; severity: ComplianceIssueSeverity; message: string; location: string; recommendation: string; blocking: boolean; confidence: number; passed: boolean; metadata?: Record<string, unknown> }
export interface ComplianceAnalysisResult { passedChecks: ComplianceCheck[]; failedChecks: ComplianceCheck[]; warnings: ComplianceCheck[]; recommendations: string[]; provider: string; model: string; tokenUsage: Record<string, number>; estimatedCost: number; processingTime: number; requestMetadata: Record<string, unknown> }

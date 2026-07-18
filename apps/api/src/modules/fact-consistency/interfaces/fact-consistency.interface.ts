import type { ExtractedClaim, FactConsistencyIssue } from '../entities/fact-consistency.entity';

export interface FactContentSegment { location: string; text: string; chapterId?: string; sectionId?: string }
export interface FactConsistencyInput { content: string; segments: FactContentSegment[] }
export interface FactAnalysisResult {
  claims: ExtractedClaim[];
  issues: FactConsistencyIssue[];
  provider: string;
  model: string;
  tokenUsage: Record<string, number>;
  estimatedCost: number;
  processingTime: number;
}
export interface FactConsistencyStrategy { analyze(input: FactConsistencyInput, claims: ExtractedClaim[]): FactConsistencyIssue[] }

import type { MatchedSection, PlagiarismFinding } from '../entities/plagiarism-detection.entity';
export interface DetectionSegment { location: string; text: string }
export interface DetectionInput { content: string; segments: DetectionSegment[] }
export interface DetectionStrategyResult { findings: PlagiarismFinding[]; matches: MatchedSection[]; score: number }
export interface PlagiarismDetectionStrategy { readonly name: string; detect(input: DetectionInput): DetectionStrategyResult }

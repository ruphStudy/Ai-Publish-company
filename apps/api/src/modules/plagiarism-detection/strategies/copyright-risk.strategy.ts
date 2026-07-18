import { Injectable } from '@nestjs/common';
import { PlagiarismCategory, PlagiarismRiskLevel } from '../entities/plagiarism-detection.entity';
import { DetectionInput, DetectionStrategyResult, PlagiarismDetectionStrategy } from '../interfaces/plagiarism-strategy.interface';
@Injectable()
export class CopyrightRiskStrategy implements PlagiarismDetectionStrategy {
  readonly name = 'copyright-risk';
  detect(input: DetectionInput): DetectionStrategyResult { const quotes = input.content.match(/[“"][^”"]{40,}[”"]/g) ?? []; const citations = input.content.match(/\[[0-9]+\]|\([A-Z][A-Za-z]+,?\s+\d{4}\)/g) ?? []; const unattributed = Math.max(0, quotes.length - citations.length); const score = Math.min(100, unattributed * 25); const findings = []; if (quotes.length) findings.push({ category: PlagiarismCategory.QUOTE_DETECTION, riskLevel: unattributed ? PlagiarismRiskLevel.MEDIUM : PlagiarismRiskLevel.LOW, message: `${quotes.length} extended quotation(s) detected.`, confidence: 85, locations: [] }); if (citations.length) findings.push({ category: PlagiarismCategory.CITATION_DETECTION, riskLevel: PlagiarismRiskLevel.NONE, message: `${citations.length} citation indicator(s) detected.`, confidence: 80, locations: [] }); if (score) findings.push({ category: PlagiarismCategory.COPYRIGHT_RISK, riskLevel: PlagiarismRiskLevel.HIGH, message: 'Extended quotation may require attribution or permission.', confidence: score, locations: [] }); return { score, findings, matches: [] }; }
}

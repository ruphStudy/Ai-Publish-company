import { Injectable } from '@nestjs/common';
import { PlagiarismCategory, PlagiarismRiskLevel } from '../entities/plagiarism-detection.entity';
import { DetectionInput, DetectionStrategyResult, PlagiarismDetectionStrategy } from '../interfaces/plagiarism-strategy.interface';
@Injectable()
export class DuplicateDetectionStrategy implements PlagiarismDetectionStrategy {
  readonly name = 'internal-duplicate';
  detect(input: DetectionInput): DetectionStrategyResult {
    const normalized = input.segments.map((segment) => segment.text.toLowerCase().replace(/\W+/g, ' ').trim());
    const matches = [];
    for (let left = 0; left < normalized.length; left += 1) for (let right = left + 1; right < normalized.length; right += 1) { const similarity = this.similarity(normalized[left], normalized[right]); if (similarity >= 0.75) matches.push({ sourceLocation: input.segments[left].location, matchedLocation: input.segments[right].location, similarity: Math.round(similarity * 100), category: similarity === 1 ? PlagiarismCategory.EXACT_DUPLICATE : PlagiarismCategory.NEAR_DUPLICATE }); }
    const score = Math.min(100, matches.reduce((sum, match) => sum + match.similarity, 0) / Math.max(1, input.segments.length));
    return { matches, score: Math.round(score), findings: matches.length ? [{ category: PlagiarismCategory.INTERNAL_DUPLICATE, riskLevel: score >= 60 ? PlagiarismRiskLevel.HIGH : PlagiarismRiskLevel.MEDIUM, message: `${matches.length} internally similar passage(s) detected.`, confidence: Math.min(100, Math.round(score)), locations: [...new Set(matches.flatMap((match) => [match.sourceLocation, match.matchedLocation]))] }] : [] };
  }
  private similarity(left: string, right: string) { if (left === right && left.length) return 1; const a = new Set(left.split(' ')); const b = new Set(right.split(' ')); const intersection = [...a].filter((word) => b.has(word)).length; const union = new Set([...a, ...b]).size; return union ? intersection / union : 0; }
}

import { Injectable } from '@nestjs/common';
import { PlagiarismCategory, PlagiarismRiskLevel } from '../entities/plagiarism-detection.entity';
import { DetectionInput, DetectionStrategyResult, PlagiarismDetectionStrategy } from '../interfaces/plagiarism-strategy.interface';
@Injectable()
export class AiRepetitionStrategy implements PlagiarismDetectionStrategy {
  readonly name = 'ai-repetition';
  detect(input: DetectionInput): DetectionStrategyResult { const sentences = input.content.split(/[.!?]+/).map((value) => value.trim().toLowerCase()).filter((value) => value.split(/\s+/).length >= 5); const repeated = sentences.length - new Set(sentences).size; const phrases = ['it is important to note', 'in conclusion', 'delve into', 'in today’s world', 'in today\'s world']; const patterns = phrases.reduce((sum, phrase) => sum + input.content.toLowerCase().split(phrase).length - 1, 0); const score = Math.min(100, repeated * 15 + patterns * 5); return { score, matches: [], findings: score ? [{ category: PlagiarismCategory.REPETITIVE_AI_CONTENT, riskLevel: score >= 50 ? PlagiarismRiskLevel.HIGH : PlagiarismRiskLevel.LOW, message: 'Repetitive or formulaic AI-style phrasing detected.', confidence: score, locations: [] }] : [] }; }
}

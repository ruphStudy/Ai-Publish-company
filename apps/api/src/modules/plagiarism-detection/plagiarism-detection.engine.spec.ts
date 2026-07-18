import type { AiProviderFactory } from '../../core/ai/ai-provider.factory';
import { PlagiarismDetectionEngine } from './plagiarism-detection.engine';
import { AiRepetitionStrategy } from './strategies/ai-repetition.strategy';
import { CopyrightRiskStrategy } from './strategies/copyright-risk.strategy';
import { DuplicateDetectionStrategy } from './strategies/duplicate-detection.strategy';
describe('PlagiarismDetectionEngine', () => {
  const engine = new PlagiarismDetectionEngine(new DuplicateDetectionStrategy(), new AiRepetitionStrategy(), new CopyrightRiskStrategy(), {} as AiProviderFactory);
  it('calculates manuscript originality and duplicate scores', async () => { const repeated = 'This is a sufficiently long repeated paragraph for detection.'; const result = await engine.detect({ content: `${repeated}\n\n${repeated}`, segments: [{ location: 'p1', text: repeated }, { location: 'p2', text: repeated }] }); expect(result.duplicateScore).toBeGreaterThan(0); expect(result.originalityScore).toBeLessThan(100); expect(result.matchedSections).toHaveLength(1); });
  it('detects repetitive AI content and copyright risk', async () => { const result = await engine.detect({ content: 'It is important to note. It is important to note. “This is an extended quotation that is intentionally longer than forty characters and lacks attribution.”', segments: [] }); expect(result.aiRepetitionScore).toBeGreaterThan(0); expect(result.copyrightRiskScore).toBeGreaterThan(0); });
});

import { FactConsistencyCategory } from './entities/fact-consistency.entity';
import { FactConsistencyEngine } from './fact-consistency.engine';
import { ClaimExtractionStrategy } from './strategies/claim-extraction.strategy';
import { DeterministicConsistencyStrategy } from './strategies/deterministic-consistency.strategy';
import { SupportConsistencyStrategy } from './strategies/support-consistency.strategy';

describe('FactConsistencyEngine', () => {
  const providers = { getOpenAi: jest.fn() };
  const engine = new FactConsistencyEngine(new ClaimExtractionStrategy(), new DeterministicConsistencyStrategy(), new SupportConsistencyStrategy(), providers as never);
  afterEach(() => { delete process.env.FACT_CONSISTENCY_AI_ASSISTED; jest.clearAllMocks(); });
  it('detects numeric conflicts across chapters without external verification', async () => {
    const result = await engine.analyze({ content: 'Revenue is 20 percent. Revenue is 30 percent.', segments: [{ location: 'chapter:1', chapterId: '1', text: 'Revenue is 20 percent.' }, { location: 'chapter:2', chapterId: '2', text: 'Revenue is 30 percent.' }] });
    expect(result.issues.some((issue) => issue.category === FactConsistencyCategory.NUMERIC_INCONSISTENCY)).toBe(true);
    expect(result.issues.some((issue) => issue.category === FactConsistencyCategory.CROSS_CHAPTER_CONTRADICTION)).toBe(true);
    expect(result.provider).toBe('internal'); expect(providers.getOpenAi).not.toHaveBeenCalled();
  });
  it('keeps uncited claims uncertain and reports missing citations', async () => {
    const result = await engine.analyze({ content: 'The system has 12 components.', segments: [{ location: 'section:1', sectionId: '1', text: 'The system has 12 components.' }] });
    expect(result.claims[0].supportStatus).toBe('UNCERTAIN');
    expect(result.issues.some((issue) => issue.category === FactConsistencyCategory.CITATION_MISSING)).toBe(true);
  });
});

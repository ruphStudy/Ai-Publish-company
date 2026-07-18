import { publicationReadinessPolicies } from './config/publication-readiness.config';
import { PublicationDecision, ReadinessGateType, ReadinessPolicyProfile, ReadinessRiskLevel } from './entities/publication-readiness.entity';
import type { ReadinessSources } from './interfaces/publication-readiness.interface';
import { PublicationReadinessEngine } from './publication-readiness.engine';

describe('PublicationReadinessEngine', () => {
  const engine = new PublicationReadinessEngine();
  const policy = publicationReadinessPolicies[ReadinessPolicyProfile.DEFAULT];
  const source = (gate: ReadinessGateType, score = 90, riskLevel = ReadinessRiskLevel.NONE, blockerCount = 0, warningCount = 0) => ({ id: `${gate}-id`, version: '1', status: 'COMPLETED', score, riskLevel, blockerCount, warningCount, reasons: [`${gate} evaluated`], recommendations: [] });
  const readySources = (): ReadinessSources => ({
    QUALITY: source(ReadinessGateType.QUALITY),
    ORIGINALITY: source(ReadinessGateType.ORIGINALITY),
    FACT_CONSISTENCY: source(ReadinessGateType.FACT_CONSISTENCY),
    COMPLIANCE: source(ReadinessGateType.COMPLIANCE),
    METADATA: source(ReadinessGateType.METADATA),
    STRUCTURE: source(ReadinessGateType.STRUCTURE),
    CONTENT_IMPROVEMENT: source(ReadinessGateType.CONTENT_IMPROVEMENT),
    EXPORT: source(ReadinessGateType.EXPORT),
    MANUAL_APPROVAL: source(ReadinessGateType.MANUAL_APPROVAL),
  });
  it('produces a READY decision when mandatory gates pass', () => {
    const result = engine.evaluate(readySources(), policy);
    expect(result.finalDecision).toBe(PublicationDecision.READY);
    expect(result.overallScore).toBe(90);
    expect(result.blockers).toHaveLength(0);
  });
  it('produces READY_WITH_WARNINGS for non-blocking warnings', () => {
    const sources = readySources();
    sources.QUALITY = source(ReadinessGateType.QUALITY, 88, ReadinessRiskLevel.LOW, 0, 1);
    expect(engine.evaluate(sources, policy).finalDecision).toBe(PublicationDecision.READY_WITH_WARNINGS);
  });
  it('produces NOT_READY for a low mandatory score', () => {
    const sources = readySources();
    sources.QUALITY = source(ReadinessGateType.QUALITY, 60);
    expect(engine.evaluate(sources, policy).finalDecision).toBe(PublicationDecision.NOT_READY);
  });
  it('produces BLOCKED for critical blockers', () => {
    const sources = readySources();
    sources.ORIGINALITY = source(ReadinessGateType.ORIGINALITY, 80, ReadinessRiskLevel.CRITICAL, 1);
    const result = engine.evaluate(sources, policy);
    expect(result.finalDecision).toBe(PublicationDecision.BLOCKED);
    expect(result.riskLevel).toBe(ReadinessRiskLevel.CRITICAL);
  });
  it('does not treat missing required sources as passed', () => {
    const sources = readySources();
    delete sources.COMPLIANCE;
    const result = engine.evaluate(sources, policy);
    expect(result.finalDecision).toBe(PublicationDecision.BLOCKED);
    expect(result.missingRequirements).toContain('COMPLIANCE source result is required');
  });
  it('rejects invalid policy weights', () => {
    expect(() => engine.evaluate(readySources(), { ...policy, gateWeights: { ...policy.gateWeights, QUALITY: -1 } })).toThrow();
  });
});

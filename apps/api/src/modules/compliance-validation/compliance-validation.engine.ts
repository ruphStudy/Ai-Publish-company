import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ComplianceCategory, ComplianceCheck, ComplianceIssueSeverity } from './entities/compliance-validation.entity';
import type { ComplianceAnalysisResult, ComplianceRuleResult, ComplianceValidationInput } from './interfaces/compliance-validation.interface';
import { CitationComplianceStrategy } from './strategies/citation-compliance.strategy';
import { ExportComplianceStrategy } from './strategies/export-compliance.strategy';
import { MetadataComplianceStrategy } from './strategies/metadata-compliance.strategy';
import { StructureComplianceStrategy } from './strategies/structure-compliance.strategy';

@Injectable()
export class ComplianceValidationEngine {
  constructor(private readonly structure: StructureComplianceStrategy, private readonly metadata: MetadataComplianceStrategy, private readonly exportReadiness: ExportComplianceStrategy, private readonly citations: CitationComplianceStrategy) {}
  analyze(input: ComplianceValidationInput): ComplianceAnalysisResult {
    const startedAt = Date.now();
    const rules = [...this.structure.analyze(input), ...this.metadata.analyze(input), ...this.exportReadiness.analyze(input), ...this.citations.analyze(input), this.versionRule(input), this.fileNamingRule(input), this.keywordCoverageRule(input)];
    const toCheck = (rule: ComplianceRuleResult): ComplianceCheck => ({ checkId: `CVCHK-${randomUUID()}`, category: rule.category, severity: rule.severity, message: rule.message, location: rule.location, recommendation: rule.recommendation, blocking: rule.blocking, confidence: rule.confidence, metadata: rule.metadata ?? {} });
    const passedChecks = rules.filter((rule) => rule.passed).map(toCheck);
    const failedChecks = rules.filter((rule) => !rule.passed && rule.blocking).map(toCheck);
    const warnings = rules.filter((rule) => !rule.passed && !rule.blocking).map(toCheck);
    return { passedChecks, failedChecks, warnings, recommendations: [...new Set([...failedChecks, ...warnings].map((check) => check.recommendation))], provider: 'internal', model: 'deterministic-compliance-v1', tokenUsage: {}, estimatedCost: 0, processingTime: Date.now() - startedAt, requestMetadata: { externalServiceUsed: false, publishingPerformed: false } };
  }
  private versionRule(input: ComplianceValidationInput): ComplianceRuleResult { const passed = /^v?\d+(\.\d+)*|.+\+.+$/.test(input.manuscriptVersion); return { category: ComplianceCategory.VERSION_CONSISTENCY, severity: passed ? ComplianceIssueSeverity.INFO : ComplianceIssueSeverity.HIGH, message: passed ? 'Manuscript version is traceable' : 'Manuscript version is not traceable', location: 'version', recommendation: passed ? 'No action required' : 'Use a stable manuscript version identifier', blocking: !passed, confidence: 90, passed }; }
  private fileNamingRule(input: ComplianceValidationInput): ComplianceRuleResult { const title = String(input.metadata.title ?? ''); const passed = title.length > 0 && !/[\\/:*?"<>|]/.test(title); return { category: ComplianceCategory.FILE_NAMING, severity: passed ? ComplianceIssueSeverity.INFO : ComplianceIssueSeverity.LOW, message: passed ? 'Title is usable for artifact names' : 'Title needs a file-safe publishing name', location: 'metadata.title', recommendation: passed ? 'No action required' : 'Remove filesystem-reserved characters from the title', blocking: false, confidence: 88, passed }; }
  private keywordCoverageRule(input: ComplianceValidationInput): ComplianceRuleResult { const keywords = Array.isArray(input.metadata.keywords) ? input.metadata.keywords.map(String) : []; const content = input.content.toLowerCase(); const matched = keywords.filter((keyword) => content.includes(keyword.toLowerCase())).length; const passed = keywords.length === 0 || matched / keywords.length >= 0.4; return { category: ComplianceCategory.KEYWORD_COVERAGE, severity: passed ? ComplianceIssueSeverity.INFO : ComplianceIssueSeverity.LOW, message: passed ? 'Keyword coverage is natural' : 'Keyword coverage is thin', location: 'seo', recommendation: passed ? 'No action required' : 'Review keyword coverage without stuffing terms', blocking: false, confidence: 80, passed, metadata: { keywords: keywords.length, matched } }; }
}

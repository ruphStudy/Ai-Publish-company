import { Injectable } from '@nestjs/common';
import { ComplianceCategory, ComplianceIssueSeverity } from '../entities/compliance-validation.entity';
import type { ComplianceRuleResult, ComplianceValidationInput } from '../interfaces/compliance-validation.interface';

@Injectable()
export class CitationComplianceStrategy {
  analyze(input: ComplianceValidationInput): ComplianceRuleResult[] {
    const citationRefs = input.content.match(/\[[0-9]+]|\([A-Z][A-Za-z]+,\s*\d{4}\)/g) ?? [];
    const referenceHeading = /(^|\n)#{1,3}\s+(references|bibliography|works cited)\b/i.test(input.markdownContent);
    const footnotes = input.markdownContent.match(/\[\^[^\]]+]/g) ?? [];
    return [
      this.result(ComplianceCategory.CITATION_FORMAT, citationRefs.length === 0 || referenceHeading, 'citations', 'Citation format has reference support', 'Add a references section for cited material', false),
      this.result(ComplianceCategory.REFERENCE_CONSISTENCY, citationRefs.length === 0 || referenceHeading, 'references', 'References are consistent with citations', 'Ensure every citation has a matching reference entry', false),
      this.result(ComplianceCategory.FOOTNOTE_CONSISTENCY, footnotes.length % 2 === 0, 'footnotes', 'Footnotes appear paired', 'Add missing footnote definitions', false),
      this.result(ComplianceCategory.DISCLAIMER_PRESENCE, !/medical|legal|financial|investment advice/i.test(input.content) || /disclaimer/i.test(input.content), 'frontmatter', 'Required disclaimers are present', 'Add a disclaimer for regulated advice content', false),
      this.result(ComplianceCategory.LANGUAGE_CONSISTENCY, !this.hasLongNonAsciiRun(input.plainTextContent), 'manuscript', 'Language appears consistent', 'Review long non-ASCII passages for language consistency', false),
    ];
  }
  private hasLongNonAsciiRun(text: string): boolean { let run = 0; for (const char of text) { run = char.charCodeAt(0) > 127 ? run + 1 : 0; if (run >= 40) return true; } return false; }
  private result(category: ComplianceCategory, passed: boolean, location: string, ok: string, bad: string, blocking: boolean): ComplianceRuleResult { return { category, severity: passed ? ComplianceIssueSeverity.INFO : ComplianceIssueSeverity.MEDIUM, message: passed ? ok : bad, location, recommendation: passed ? 'No action required' : bad, blocking: !passed && blocking, confidence: 85, passed }; }
}

import { Injectable } from '@nestjs/common';
import { ComplianceCategory, ComplianceIssueSeverity } from '../entities/compliance-validation.entity';
import type { ComplianceRuleResult, ComplianceValidationInput } from '../interfaces/compliance-validation.interface';

@Injectable()
export class StructureComplianceStrategy {
  analyze(input: ComplianceValidationInput): ComplianceRuleResult[] {
    const headings = input.markdownContent.match(/^#{1,6}\s+.+$/gm) ?? [];
    const chapters = input.segments.filter((segment) => segment.location.startsWith('chapter:')).length;
    return [
      this.result(ComplianceCategory.BOOK_STRUCTURE, input.content.trim().length > 0, 'manuscript', 'Manuscript content is present', 'Add manuscript content before validation', true),
      this.result(ComplianceCategory.CHAPTER_ORGANIZATION, chapters > 0, 'manuscript', 'Chapter structure is present', 'Generate or attach chapter content', true),
      this.result(ComplianceCategory.HEADING_HIERARCHY, headings.every((heading) => heading.startsWith('#') || heading.startsWith('##')), 'markdown', 'Heading hierarchy is publishable', 'Use predictable top-level and chapter-level headings', false),
      this.result(ComplianceCategory.MARKDOWN_VALIDATION, !/\[[^\]]*]\(\s*\)/.test(input.markdownContent), 'markdown', 'Markdown links are valid', 'Fill empty markdown link targets', false),
      this.result(ComplianceCategory.HTML_VALIDATION, !/<script[\s>]/i.test(input.htmlContent), 'html', 'HTML does not contain script tags', 'Remove unsafe script content from exportable HTML', true),
    ];
  }
  private result(category: ComplianceCategory, passed: boolean, location: string, ok: string, bad: string, blocking: boolean): ComplianceRuleResult { return { category, severity: passed ? ComplianceIssueSeverity.INFO : blocking ? ComplianceIssueSeverity.CRITICAL : ComplianceIssueSeverity.MEDIUM, message: passed ? ok : bad, location, recommendation: passed ? 'No action required' : bad, blocking: !passed && blocking, confidence: 95, passed }; }
}

import { Injectable } from '@nestjs/common';
import { ComplianceCategory, ComplianceIssueSeverity } from '../entities/compliance-validation.entity';
import type { ComplianceRuleResult, ComplianceValidationInput } from '../interfaces/compliance-validation.interface';

@Injectable()
export class ExportComplianceStrategy {
  analyze(input: ComplianceValidationInput): ComplianceRuleResult[] {
    const hasToc = Boolean(input.toc);
    const images = input.markdownContent.match(/!\[[^\]]*]\([^)]+\)/g) ?? [];
    const imagesHaveAlt = images.every((image) => !image.startsWith('![]'));
    const links = input.markdownContent.match(/\[[^\]]+]\([^)]+\)/g) ?? [];
    return [
      this.result(ComplianceCategory.TABLE_OF_CONTENTS, hasToc, 'toc', 'Table of contents exists', 'Generate a table of contents before export', false),
      this.result(ComplianceCategory.ACCESSIBILITY_VALIDATION, imagesHaveAlt, 'manuscript', 'Images include accessible alt text', 'Add alt text to every image reference', false),
      this.result(ComplianceCategory.IMAGE_REFERENCE_VALIDATION, images.every((image) => !/\((https?:)?\/\/example\.com/i.test(image)), 'manuscript', 'Image references are not placeholders', 'Replace placeholder image references', false),
      this.result(ComplianceCategory.INTERNAL_LINK_VALIDATION, links.every((link) => !/\(#\s*\)/.test(link)), 'manuscript', 'Internal links are complete', 'Fill or remove empty internal links', false),
      this.result(ComplianceCategory.EPUB_READINESS, input.markdownContent.length > 0 && hasToc, 'export', 'EPUB prerequisites are available', 'Generate manuscript and TOC before EPUB export', true),
      this.result(ComplianceCategory.PDF_READINESS, input.plainTextContent.trim().length > 0, 'export', 'PDF source text is available', 'Generate plain text content before PDF export', true),
      this.result(ComplianceCategory.DOCX_READINESS, input.markdownContent.trim().length > 0, 'export', 'DOCX source markdown is available', 'Generate markdown content before DOCX export', true),
      this.result(ComplianceCategory.PRINT_READINESS, /copyright|all rights reserved/i.test(input.content), 'export', 'Print copyright prerequisite is available', 'Add copyright text before print export', false),
      this.result(ComplianceCategory.EXPORT_DEPENDENCY_VALIDATION, input.manuscriptVersion.trim().length > 0, 'export', 'Manuscript version is present', 'Provide an immutable manuscript version', true),
    ];
  }
  private result(category: ComplianceCategory, passed: boolean, location: string, ok: string, bad: string, blocking: boolean): ComplianceRuleResult { return { category, severity: passed ? ComplianceIssueSeverity.INFO : blocking ? ComplianceIssueSeverity.CRITICAL : ComplianceIssueSeverity.LOW, message: passed ? ok : bad, location, recommendation: passed ? 'No action required' : bad, blocking: !passed && blocking, confidence: 92, passed }; }
}

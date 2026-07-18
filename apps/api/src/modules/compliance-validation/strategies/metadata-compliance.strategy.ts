import { Injectable } from '@nestjs/common';
import { ComplianceCategory, ComplianceIssueSeverity } from '../entities/compliance-validation.entity';
import type { ComplianceRuleResult, ComplianceValidationInput } from '../interfaces/compliance-validation.interface';

@Injectable()
export class MetadataComplianceStrategy {
  analyze(input: ComplianceValidationInput): ComplianceRuleResult[] {
    const metadata = input.metadata;
    const has = (key: string) => typeof metadata[key] === 'string' ? String(metadata[key]).trim().length > 0 : Array.isArray(metadata[key]) ? (metadata[key] as unknown[]).length > 0 : Boolean(metadata[key]);
    return [
      this.result(ComplianceCategory.METADATA_COMPLETENESS, ['title', 'shortDescription', 'longDescription', 'language'].every(has), 'metadata', 'Required metadata is complete', 'Complete title, descriptions, and language metadata', true),
      this.result(ComplianceCategory.AUTHOR_INFORMATION, has('authorName') || has('publisherName'), 'metadata', 'Author or publisher information is present', 'Add author or publisher information', false),
      this.result(ComplianceCategory.COPYRIGHT_PAGE, has('copyrightText') || /copyright|all rights reserved/i.test(input.content), 'metadata', 'Copyright text is available', 'Add copyright text or a copyright page', false),
      this.result(ComplianceCategory.ISBN_READINESS, has('isbn'), 'metadata', 'ISBN metadata is present', 'Add ISBN when preparing marketplace submission', false),
      this.result(ComplianceCategory.SEO_METADATA, has('seoDescription') && has('keywords'), 'metadata', 'SEO metadata is present', 'Add SEO description and keywords', false),
      this.result(ComplianceCategory.CATEGORY_ASSIGNMENT, has('bisacCategories') || has('amazonCategories') || has('googleCategories'), 'metadata', 'Publishing categories are assigned', 'Assign platform or BISAC categories', false),
    ];
  }
  private result(category: ComplianceCategory, passed: boolean, location: string, ok: string, bad: string, blocking: boolean): ComplianceRuleResult { return { category, severity: passed ? ComplianceIssueSeverity.INFO : blocking ? ComplianceIssueSeverity.HIGH : ComplianceIssueSeverity.MEDIUM, message: passed ? ok : bad, location, recommendation: passed ? 'No action required' : bad, blocking: !passed && blocking, confidence: 90, passed }; }
}

import { ComplianceCategory, ComplianceLevel, ComplianceValidationScope, ComplianceValidationTargetType } from './entities/compliance-validation.entity';
import { ComplianceValidationEngine } from './compliance-validation.engine';
import { ComplianceValidationFactory } from './compliance-validation.factory';
import { CitationComplianceStrategy } from './strategies/citation-compliance.strategy';
import { ExportComplianceStrategy } from './strategies/export-compliance.strategy';
import { MetadataComplianceStrategy } from './strategies/metadata-compliance.strategy';
import { StructureComplianceStrategy } from './strategies/structure-compliance.strategy';

describe('ComplianceValidationEngine', () => {
  const engine = new ComplianceValidationEngine(new StructureComplianceStrategy(), new MetadataComplianceStrategy(), new ExportComplianceStrategy(), new CitationComplianceStrategy());
  const factory = new ComplianceValidationFactory();
  const input = { content: '# Title\n\nChapter content copyright 2026.', markdownContent: '# Title\n\nChapter content copyright 2026.', htmlContent: '<h1>Title</h1>', plainTextContent: 'Title Chapter content copyright 2026.', segments: [{ location: 'chapter:1:paragraph:1', text: 'Chapter content copyright 2026.', chapterId: '1' }], metadata: { title: 'Good Title', shortDescription: 'Short', longDescription: 'Long', language: 'en', authorName: 'Author', copyrightText: 'Copyright 2026', seoDescription: 'SEO', keywords: ['content'], bisacCategories: ['BUS000000'] }, toc: { tocId: 'toc' }, manuscriptVersion: '1.0.0' };
  it('validates manuscript compliance and calculates readiness', () => {
    const result = engine.analyze(input);
    expect(result.provider).toBe('internal');
    expect(result.passedChecks.some((check) => check.category === ComplianceCategory.METADATA_COMPLETENESS)).toBe(true);
    expect(result.failedChecks.length).toBe(0);
    const validation = factory.create({ projectId: 'project', targetType: ComplianceValidationTargetType.MANUSCRIPT, targetId: 'project', manuscriptVersion: '1.0.0', scope: ComplianceValidationScope.MANUSCRIPT, complianceVersion: 1 }, result);
    expect([ComplianceLevel.PASS, ComplianceLevel.WARNING]).toContain(validation.complianceLevel);
    expect(validation.publicationReadinessScore).toBeGreaterThan(80);
  });
  it('detects blocking export and manuscript issues', () => {
    const result = engine.analyze({ ...input, content: '', markdownContent: '', htmlContent: '<script></script>', plainTextContent: '', segments: [], metadata: {}, toc: null, manuscriptVersion: 'draft' });
    expect(result.failedChecks.some((check) => check.category === ComplianceCategory.BOOK_STRUCTURE)).toBe(true);
    expect(result.failedChecks.some((check) => check.category === ComplianceCategory.HTML_VALIDATION)).toBe(true);
    expect(result.warnings.some((check) => check.category === ComplianceCategory.METADATA_COMPLETENESS)).toBe(false);
  });
  it('flags warnings for citation, accessibility, SEO, and export readiness', () => {
    const result = engine.analyze({ ...input, content: 'Medical advice [1].', markdownContent: '# Title\n\n![](cover.png)\n\nMedical advice [1].', metadata: { title: 'Bad:Title', keywords: ['missing'] }, toc: null });
    expect(result.warnings.some((check) => check.category === ComplianceCategory.CITATION_FORMAT)).toBe(true);
    expect(result.warnings.some((check) => check.category === ComplianceCategory.ACCESSIBILITY_VALIDATION)).toBe(true);
    expect(result.warnings.some((check) => check.category === ComplianceCategory.KEYWORD_COVERAGE)).toBe(true);
    expect(result.failedChecks.some((check) => check.category === ComplianceCategory.EPUB_READINESS)).toBe(true);
  });
});

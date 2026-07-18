import { Draft2DigitalSubmissionChecklistBuilder } from './draft2digital-checklist.builder';
import { Draft2DigitalMetadataMapper } from './draft2digital-metadata.mapper';
import { Draft2DigitalPackageBuilder } from './draft2digital-package.builder';
import { Draft2DigitalValidator } from './draft2digital.validator';
import { Draft2DigitalFormat } from './entities/draft2digital.entity';

describe('Draft2DigitalPackageBuilder', () => {
  const builder = new Draft2DigitalPackageBuilder(new Draft2DigitalMetadataMapper(), new Draft2DigitalSubmissionChecklistBuilder(), new Draft2DigitalValidator());
  const metadata = { title: 'Book', authorName: 'Author', longDescription: 'Description', language: 'en', keywords: ['one'], bisacCategories: ['BUSINESS'] };
  const exportJob = { status: 'COMPLETED', generatedFiles: [{ artifactId: 'a1', exportJobId: 'e1', format: 'EPUB', filename: 'book.epub', fileExtension: 'epub', mimeType: 'application/epub+zip', storageProvider: 'local', storagePath: '/tmp/book.epub', downloadUrl: '', checksum: 'sha256', fileSize: 100, generatedAt: new Date() }] } as never;
  it('prepares a deterministic EPUB package with checklist', () => {
    const first = builder.build({ projectId: 'p', manuscriptVersion: '1', d2dFormat: Draft2DigitalFormat.EPUB, metadata, exportJob });
    const second = builder.build({ projectId: 'p', manuscriptVersion: '1', d2dFormat: Draft2DigitalFormat.EPUB, metadata, exportJob });
    expect(first.submissionFingerprint).toBe(second.submissionFingerprint);
    expect(first.checklist.length).toBeGreaterThan(5);
    expect(first.validationIssues).toHaveLength(0);
  });
  it('reports missing print artifacts', () => {
    const prepared = builder.build({ projectId: 'p', manuscriptVersion: '1', d2dFormat: Draft2DigitalFormat.PRINT, metadata, exportJob });
    expect(prepared.validationIssues).toContain('Required Draft2Digital artifact is missing: PDF');
  });
});

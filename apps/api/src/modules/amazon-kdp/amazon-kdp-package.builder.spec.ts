import { AmazonKdpSubmissionChecklistBuilder } from './amazon-kdp-checklist.builder';
import { AmazonKdpMetadataMapper } from './amazon-kdp-metadata.mapper';
import { AmazonKdpPackageBuilder } from './amazon-kdp-package.builder';
import { AmazonKdpValidator } from './amazon-kdp.validator';
import { AmazonKdpFormat } from './entities/amazon-kdp.entity';

describe('AmazonKdpPackageBuilder', () => {
  const builder = new AmazonKdpPackageBuilder(new AmazonKdpMetadataMapper(), new AmazonKdpSubmissionChecklistBuilder(), new AmazonKdpValidator());
  const metadata = { title: 'Book', authorName: 'Author', longDescription: 'Description', language: 'en', keywords: ['one'], amazonCategories: ['BUSINESS'] };
  const exportJob = { status: 'COMPLETED', generatedFiles: [{ artifactId: 'a1', exportJobId: 'e1', format: 'EPUB', filename: 'book.epub', fileExtension: 'epub', mimeType: 'application/epub+zip', storageProvider: 'local', storagePath: '/tmp/book.epub', downloadUrl: '', checksum: 'sha256', fileSize: 100, generatedAt: new Date() }] } as never;
  it('prepares a deterministic eBook package with checklist', () => {
    const first = builder.build({ projectId: 'p', manuscriptVersion: '1', kdpFormat: AmazonKdpFormat.KINDLE_EBOOK, metadata, exportJob });
    const second = builder.build({ projectId: 'p', manuscriptVersion: '1', kdpFormat: AmazonKdpFormat.KINDLE_EBOOK, metadata, exportJob });
    expect(first.submissionFingerprint).toBe(second.submissionFingerprint);
    expect(first.checklist.length).toBeGreaterThan(10);
    expect(first.validationIssues).toHaveLength(0);
  });
  it('reports missing print artifacts', () => {
    const prepared = builder.build({ projectId: 'p', manuscriptVersion: '1', kdpFormat: AmazonKdpFormat.PAPERBACK, metadata, exportJob });
    expect(prepared.validationIssues).toContain('Required KDP artifact is missing: PRINT_PDF');
  });
});

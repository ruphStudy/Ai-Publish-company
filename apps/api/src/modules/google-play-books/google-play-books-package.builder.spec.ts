import { GooglePlayBooksSubmissionChecklistBuilder } from './google-play-books-checklist.builder';
import { GooglePlayBooksFormat } from './entities/google-play-books.entity';
import { GooglePlayBooksMetadataMapper } from './google-play-books-metadata.mapper';
import { GooglePlayBooksPackageBuilder } from './google-play-books-package.builder';
import { GooglePlayBooksValidator } from './google-play-books.validator';

describe('GooglePlayBooksPackageBuilder', () => {
  const builder = new GooglePlayBooksPackageBuilder(new GooglePlayBooksMetadataMapper(), new GooglePlayBooksSubmissionChecklistBuilder(), new GooglePlayBooksValidator());
  const metadata = { title: 'Book', authorName: 'Author', publisherName: 'Publisher', longDescription: 'Description', language: 'en', keywords: ['one'], bisacCategories: ['BUSINESS'] };
  const exportJob = { status: 'COMPLETED', generatedFiles: [{ artifactId: 'a1', exportJobId: 'e1', format: 'EPUB', filename: 'book.epub', fileExtension: 'epub', mimeType: 'application/epub+zip', storageProvider: 'local', storagePath: '/tmp/book.epub', downloadUrl: '', checksum: 'sha256', fileSize: 100, generatedAt: new Date() }, { artifactId: 'a2', exportJobId: 'e1', format: 'PDF', filename: 'book.pdf', fileExtension: 'pdf', mimeType: 'application/pdf', storageProvider: 'local', storagePath: '/tmp/book.pdf', downloadUrl: '', checksum: 'sha256', fileSize: 100, generatedAt: new Date() }] } as never;
  it('prepares deterministic EPUB and PDF packages with checklist', () => {
    const epub = builder.build({ projectId: 'p', manuscriptVersion: '1', contentFormat: GooglePlayBooksFormat.EPUB, metadata, exportJob });
    const pdf = builder.build({ projectId: 'p', manuscriptVersion: '1', contentFormat: GooglePlayBooksFormat.PDF_EBOOK, metadata, exportJob });
    expect(epub.submissionFingerprint).toBe(builder.build({ projectId: 'p', manuscriptVersion: '1', contentFormat: GooglePlayBooksFormat.EPUB, metadata, exportJob }).submissionFingerprint);
    expect(pdf.validationIssues).toHaveLength(0);
    expect(epub.checklist.length).toBeGreaterThan(20);
  });
  it('reports missing content artifact', () => {
    const prepared = builder.build({ projectId: 'p', manuscriptVersion: '1', contentFormat: GooglePlayBooksFormat.PDF_EBOOK, metadata, exportJob: { status: 'COMPLETED', generatedFiles: [] } as never });
    expect(prepared.validationIssues).toContain('Required Google Play Books artifact is missing: PDF');
  });
});

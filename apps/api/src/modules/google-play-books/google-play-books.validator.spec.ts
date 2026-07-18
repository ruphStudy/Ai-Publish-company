import { BadRequestException } from '@nestjs/common';
import { GooglePlayBooksFileProcessingStatus, GooglePlayBooksIdentifierStrategy, GooglePlayBooksIntegrationMode, GooglePlayBooksStatus } from './entities/google-play-books.entity';
import { GooglePlayBooksValidator } from './google-play-books.validator';

describe('GooglePlayBooksValidator', () => {
  const validator = new GooglePlayBooksValidator();
  it('validates required metadata and identifier strategy', () => {
    const issues = validator.validateMetadata({ title: '', publisher: '', primaryAuthor: '', contributors: [], description: '', language: '', subjectCategories: [], keywords: [], identifierStrategy: GooglePlayBooksIdentifierStrategy.ISBN, territories: [], salesTerritories: [], previewTerritories: [], pricing: { territory: 'US', currency: 'US', amount: -1, taxIncluded: false, pricingProfile: 'DEFAULT', effectiveDate: '2026-01-01', sourcePricingVersion: 'v1' }, rightsInformation: {}, drmPreference: false, copyPastePreference: false, previewPercentage: 101, aiContentDisclosure: {} });
    expect(issues).toContain('Google Play Books title is required');
    expect(issues).toContain('ISBN is required for ISBN identifier strategy');
    expect(issues).toContain('Google Play Books preview percentage is invalid');
  });
  it('rejects API mode', () => {
    expect(() => validator.validateConfiguration(GooglePlayBooksIntegrationMode.API)).toThrow(BadRequestException);
  });
  it('enforces publication and processing transitions', () => {
    expect(() => validator.validateStatusTransition(GooglePlayBooksStatus.READY_FOR_SUBMISSION, GooglePlayBooksStatus.SUBMISSION_RECORDED)).not.toThrow();
    expect(() => validator.validateStatusTransition(GooglePlayBooksStatus.LIVE, GooglePlayBooksStatus.IN_REVIEW)).toThrow(BadRequestException);
    expect(() => validator.validateProcessingTransition(GooglePlayBooksFileProcessingStatus.PENDING, GooglePlayBooksFileProcessingStatus.PROCESSING)).not.toThrow();
  });
});

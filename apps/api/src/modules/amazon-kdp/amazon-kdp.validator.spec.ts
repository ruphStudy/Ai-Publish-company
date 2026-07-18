import { BadRequestException } from '@nestjs/common';
import { AmazonKdpFormat, AmazonKdpIntegrationMode, AmazonKdpStatus } from './entities/amazon-kdp.entity';
import { AmazonKdpValidator } from './amazon-kdp.validator';

describe('AmazonKdpValidator', () => {
  const validator = new AmazonKdpValidator();
  it('validates required metadata', () => {
    const issues = validator.validateMetadata({ title: '', primaryAuthor: '', contributors: [], description: '', publishingRights: 'AUTHOR_OWNS_RIGHTS', keywords: [], categories: [], primaryMarketplace: '', language: '', drmPreference: false, kdpSelectPreference: false, territories: [], pricing: { currency: 'USD', listPrice: 9.99, marketplace: 'US', territory: 'WORLDWIDE', royaltyPreference: 'STANDARD', minimumPrice: 0.99, maximumPrice: 250, taxIncluded: false, sourcePricingProfile: 'DEFAULT', pricingVersion: 'v1' }, aiContentDisclosure: {} }, AmazonKdpFormat.KINDLE_EBOOK);
    expect(issues).toContain('KDP title is required');
    expect(issues).toContain('KDP primary author is required');
  });
  it('rejects API mode', () => {
    expect(() => validator.validateConfiguration(AmazonKdpIntegrationMode.API)).toThrow(BadRequestException);
  });
  it('enforces manual status transitions', () => {
    expect(() => validator.validateStatusTransition(AmazonKdpStatus.READY_FOR_SUBMISSION, AmazonKdpStatus.SUBMISSION_RECORDED)).not.toThrow();
    expect(() => validator.validateStatusTransition(AmazonKdpStatus.LIVE, AmazonKdpStatus.IN_REVIEW)).toThrow(BadRequestException);
  });
});

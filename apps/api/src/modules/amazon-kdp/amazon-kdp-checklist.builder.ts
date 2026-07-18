import { Injectable } from '@nestjs/common';
import { AmazonKdpChecklistStatus } from './entities/amazon-kdp.entity';
import type { AmazonKdpChecklistItem } from './entities/amazon-kdp.entity';
import type { AmazonKdpMetadata } from './interfaces/amazon-kdp.interface';

@Injectable()
export class AmazonKdpSubmissionChecklistBuilder {
  build(metadata: AmazonKdpMetadata): AmazonKdpChecklistItem[] {
    return ['Open KDP Bookshelf', 'Create or select title', 'Enter book details', 'Enter contributors', 'Enter description', 'Confirm publishing rights', 'Enter keywords', 'Select categories', 'Configure age and grade range', 'Upload manuscript', 'Upload cover', 'Configure ISBN where applicable', 'Configure print options where applicable', 'Launch KDP Previewer', 'Review preview warnings', 'Configure territories', 'Configure pricing', 'Review AI-content disclosure', 'Save as draft', 'Submit for publication', 'Record KDP identifiers and submission timestamp in APC'].map((title, index) => ({ sequence: index + 1, category: index < 9 ? 'METADATA' : index < 15 ? 'FILES_AND_PREVIEW' : 'SUBMISSION', title, description: `${title} in Amazon KDP manual workflow.`, required: true, completionStatus: AmazonKdpChecklistStatus.NOT_STARTED, sourceApcField: this.sourceField(title), mappedValue: this.value(title, metadata), validationStatus: 'PENDING_MANUAL_CONFIRMATION', warning: title.includes('Submit') ? 'External submission has not occurred in APC.' : null, manualConfirmationRequired: true }));
  }
  private sourceField(title: string): string | null { if (title.includes('description')) return 'bookMetadata.description'; if (title.includes('keywords')) return 'bookMetadata.keywords'; if (title.includes('categories')) return 'bookMetadata.categories'; if (title.includes('pricing')) return 'kdpConfiguration.pricingProfile'; return null; }
  private value(title: string, metadata: AmazonKdpMetadata): string | null { if (title.includes('description')) return 'Mapped description available'; if (title.includes('keywords')) return metadata.keywords.join(', '); if (title.includes('categories')) return metadata.categories.join(', '); if (title.includes('pricing')) return `${metadata.pricing.currency} ${metadata.pricing.listPrice}`; return null; }
}

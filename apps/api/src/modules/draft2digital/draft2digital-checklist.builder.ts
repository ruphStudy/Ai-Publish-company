import { Injectable } from '@nestjs/common';
import { Draft2DigitalChecklistStatus } from './entities/draft2digital.entity';
import type { Draft2DigitalChecklistItem } from './entities/draft2digital.entity';
import type { Draft2DigitalMetadata } from './interfaces/draft2digital.interface';

@Injectable()
export class Draft2DigitalSubmissionChecklistBuilder {
  build(metadata: Draft2DigitalMetadata): Draft2DigitalChecklistItem[] {
    return ['Login to Draft2Digital', 'Create title', 'Upload metadata', 'Upload manuscript', 'Upload cover', 'Configure pricing', 'Configure territories', 'Review distribution settings', 'Publish or submit for review', 'Record publication identifiers in APC'].map((title, index) => ({ sequence: index + 1, category: index < 3 ? 'METADATA' : index < 5 ? 'FILES' : 'SUBMISSION', title, description: `${title} in Draft2Digital manual workflow.`, required: true, completionStatus: Draft2DigitalChecklistStatus.NOT_STARTED, sourceApcField: this.sourceField(title), mappedValue: this.value(title, metadata), validationStatus: 'PENDING_MANUAL_CONFIRMATION', warning: title.includes('Publish') ? 'External submission has not occurred in APC.' : null }));
  }
  private sourceField(title: string): string | null { if (title.includes('metadata')) return 'bookMetadata'; if (title.includes('pricing')) return 'draft2DigitalConfiguration.pricingProfile'; if (title.includes('territories')) return 'draft2DigitalConfiguration.territoryProfile'; return null; }
  private value(title: string, metadata: Draft2DigitalMetadata): string | null { if (title.includes('metadata')) return metadata.title; if (title.includes('pricing')) return `${metadata.pricing.currency} ${metadata.pricing.listPrice}`; if (title.includes('territories')) return metadata.territories.join(', '); return null; }
}

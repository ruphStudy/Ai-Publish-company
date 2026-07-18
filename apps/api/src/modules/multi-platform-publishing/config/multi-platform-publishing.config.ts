import type { PublishingScope } from '../../publishing-workflow/entities/publishing-workflow.entity';
import { MultiPlatformConflictPolicy, MultiPlatformExecutionStrategy, MultiPlatformFailurePolicy, MultiPlatformPartialSuccessPolicy } from '../entities/multi-platform-publishing.entity';

export interface MultiPlatformProviderConfig { providerKey: string; enabled: boolean; priority: number; required: boolean; dependencies: string[]; supportedFormats: Record<PublishingScope, string[]>; storefronts: string[] }
export interface MultiPlatformPublishingPolicy {
  policyProfile: string;
  policyVersion: string;
  enabledProviders: MultiPlatformProviderConfig[];
  executionStrategy: MultiPlatformExecutionStrategy;
  requiredProviders: string[];
  optionalProviders: string[];
  maximumRetries: number;
  retryDelayMs: number;
  parallelismLimit: number;
  partialSuccessPolicy: MultiPlatformPartialSuccessPolicy;
  failurePolicy: MultiPlatformFailurePolicy;
  conflictPolicy: MultiPlatformConflictPolicy;
}
export const multiPlatformPublishingDefaultPolicy: MultiPlatformPublishingPolicy = {
  policyProfile: 'DEFAULT',
  policyVersion: 'multi-platform-publishing-default-v1',
  executionStrategy: MultiPlatformExecutionStrategy.DEPENDENCY_AWARE,
  requiredProviders: ['AMAZON_KDP'],
  optionalProviders: ['DRAFT2DIGITAL', 'GOOGLE_PLAY_BOOKS'],
  maximumRetries: 2,
  retryDelayMs: 1000,
  parallelismLimit: 3,
  partialSuccessPolicy: MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL,
  failurePolicy: MultiPlatformFailurePolicy.CONTINUE_INDEPENDENT_TARGETS,
  conflictPolicy: MultiPlatformConflictPolicy.WARN,
  enabledProviders: [
    { providerKey: 'AMAZON_KDP', enabled: true, priority: 1, required: true, dependencies: [], storefronts: ['AMAZON'], supportedFormats: { EBOOK: ['KINDLE_EBOOK'], PRINT: ['PAPERBACK'], BOTH: ['KINDLE_EBOOK', 'PAPERBACK'] } },
    { providerKey: 'DRAFT2DIGITAL', enabled: true, priority: 2, required: false, dependencies: [], storefronts: ['APPLE', 'BARNES_NOBLE', 'KOBO'], supportedFormats: { EBOOK: ['EPUB'], PRINT: ['PRINT'], BOTH: ['EPUB', 'PRINT'] } },
    { providerKey: 'GOOGLE_PLAY_BOOKS', enabled: true, priority: 3, required: false, dependencies: [], storefronts: ['GOOGLE_PLAY'], supportedFormats: { EBOOK: ['EPUB', 'PDF_EBOOK'], PRINT: [], BOTH: ['EPUB', 'PDF_EBOOK'] } },
  ],
};

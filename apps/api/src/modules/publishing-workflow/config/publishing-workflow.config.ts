import { PublishingCapability, PublishingPartialFailurePolicy, PublishingRetryStrategyType, PublishingTargetType } from '../entities/publishing-workflow.entity';
import type { PublishingScope } from '../entities/publishing-workflow.entity';

export interface PublishingWorkflowPolicy {
  profile: string;
  policyVersion: string;
  enabledTargets: PublishingTargetConfig[];
  requiredPublicationFormats: string[];
  requiredAssets: string[];
  requiredApprovals: string[];
  maximumRetryCount: number;
  retryDelayMs: number;
  backoffStrategy: PublishingRetryStrategyType;
  pollingIntervalMs: number;
  workflowTimeoutMs: number;
  targetTimeoutMs: number;
  idempotencyWindowMs: number;
  partialSuccessPolicy: PublishingPartialFailurePolicy;
  failurePolicy: string;
  cancellationPolicy: string;
  autoResumePolicy: string;
  manualInterventionRules: string[];
  platformProfile: string;
  bookTypeProfile: string;
  languageProfile: string;
  territoryProfile: string;
}
export interface PublishingTargetConfig {
  targetType: PublishingTargetType;
  targetKey: string;
  providerKey: string;
  configurationProfile: string;
  priority: number;
  capabilities: PublishingCapability[];
  requestedFormats: string[];
}
export const defaultPublishingWorkflowPolicy: PublishingWorkflowPolicy = {
  profile: 'DEFAULT',
  policyVersion: 'publishing-workflow-default-v1',
  enabledTargets: [{ targetType: PublishingTargetType.DIRECT_EXPORT, targetKey: 'mock-direct-export', providerKey: 'mock', configurationProfile: 'mock', priority: 1, capabilities: [PublishingCapability.EBOOK, PublishingCapability.PRINT, PublishingCapability.STATUS_POLLING, PublishingCapability.CANCELLATION], requestedFormats: ['PDF', 'EPUB', 'DOCX'] }],
  requiredPublicationFormats: ['PDF'],
  requiredAssets: [],
  requiredApprovals: ['PUBLICATION_READINESS'],
  maximumRetryCount: 2,
  retryDelayMs: 1000,
  backoffStrategy: PublishingRetryStrategyType.EXPONENTIAL,
  pollingIntervalMs: 5000,
  workflowTimeoutMs: 900000,
  targetTimeoutMs: 300000,
  idempotencyWindowMs: 86400000,
  partialSuccessPolicy: PublishingPartialFailurePolicy.ALLOW_PARTIAL,
  failurePolicy: 'TERMINAL_AFTER_RETRIES',
  cancellationPolicy: 'BEST_EFFORT',
  autoResumePolicy: 'DISABLED',
  manualInterventionRules: [],
  platformProfile: 'DEFAULT',
  bookTypeProfile: 'DEFAULT',
  languageProfile: 'en',
  territoryProfile: 'WORLDWIDE',
};
export const publishingWorkflowQueueName = 'publishing-workflow';
export const scopeFormats: Record<PublishingScope, string[]> = { EBOOK: ['EPUB'], PRINT: ['PDF'], BOTH: ['PDF', 'EPUB'] };

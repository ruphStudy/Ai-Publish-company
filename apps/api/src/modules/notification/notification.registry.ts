import { Injectable } from '@nestjs/common';
import { NotificationCategory, NotificationChannel, NotificationPriority, NotificationRecipientStrategy, NotificationSeverity } from './entities/notification.entity';
import type { NotificationDefinition, NotificationTemplate } from './interfaces/notification.interface';

const defaultTemplates: NotificationTemplate[] = [
  { templateKey: 'generic.in_app', channel: NotificationChannel.IN_APP, title: '{{title}}', message: '{{message}}', body: '{{body}}', actionLabel: '{{actionLabel}}', actionUrl: '{{actionUrl}}', requiredVariables: ['title', 'message'] },
  { templateKey: 'generic.email', channel: NotificationChannel.EMAIL, title: '{{title}}', message: '{{message}}', body: '{{body}}', actionLabel: '{{actionLabel}}', actionUrl: '{{actionUrl}}', requiredVariables: ['title', 'message'] },
  { templateKey: 'generic.webhook', channel: NotificationChannel.WEBHOOK, title: '{{title}}', message: '{{message}}', body: '{{body}}', actionLabel: '{{actionLabel}}', actionUrl: '{{actionUrl}}', requiredVariables: ['title', 'message'] },
];

const definitions: NotificationDefinition[] = [
  [NotificationCategory.PUBLISHING, 'publishing.status.changed', 'Publishing status changed', 'Publishing workflow status updates'],
  [NotificationCategory.IMPORTS, 'import.completed', 'Import completed', 'Sales or royalty import completed'],
  [NotificationCategory.IMPORTS, 'import.failed', 'Import failed', 'Sales or royalty import failed', NotificationSeverity.ERROR],
  [NotificationCategory.SYNCHRONIZATION, 'sync.failed', 'Synchronization failed', 'Provider or marketplace synchronization failed', NotificationSeverity.ERROR],
  [NotificationCategory.ANALYTICS, 'analytics.refreshed', 'Analytics refreshed', 'Analytics refresh completed'],
  [NotificationCategory.OPPORTUNITIES, 'opportunity.detected', 'Opportunity detected', 'New opportunity detected', NotificationSeverity.INFO, NotificationPriority.HIGH],
  [NotificationCategory.AI_INSIGHTS, 'ai_insight.generated', 'AI insight generated', 'New AI insight generated'],
  [NotificationCategory.BACKGROUND_JOBS, 'job.failed', 'Background job failed', 'Background job failed', NotificationSeverity.ERROR],
  [NotificationCategory.PROVIDER_INTEGRATIONS, 'provider.status.changed', 'Provider status changed', 'Provider integration status changed'],
  [NotificationCategory.MARKETPLACE_INTEGRATIONS, 'marketplace.status.changed', 'Marketplace status changed', 'Marketplace integration status changed'],
  [NotificationCategory.SECURITY, 'security.alert', 'Security alert', 'Security event requiring attention', NotificationSeverity.CRITICAL, NotificationPriority.CRITICAL],
  [NotificationCategory.ADMINISTRATION, 'administration.changed', 'Administration changed', 'Administrative configuration changed'],
  [NotificationCategory.SYSTEM_HEALTH, 'system.health.degraded', 'System health degraded', 'System health degraded', NotificationSeverity.ERROR, NotificationPriority.HIGH],
].map(([category, eventKey, displayName, description, severity = NotificationSeverity.INFO, priority = NotificationPriority.NORMAL]) => ({
  eventKey,
  category,
  displayName,
  description,
  defaultSeverity: severity,
  supportedChannels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.WEBHOOK],
  defaultChannels: [NotificationChannel.IN_APP],
  recipientStrategy: category === NotificationCategory.SECURITY ? NotificationRecipientStrategy.SYSTEM_ADMINISTRATORS : NotificationRecipientStrategy.EVENT_PROVIDED_RECIPIENTS,
  permissionRequirements: [],
  templateKeys: { [NotificationChannel.IN_APP]: 'generic.in_app', [NotificationChannel.EMAIL]: 'generic.email', [NotificationChannel.WEBHOOK]: 'generic.webhook' },
  deduplicationPolicy: 'EVENT_RECIPIENT_ENTITY',
  deliveryPriority: priority,
  preferenceEligible: category !== NotificationCategory.SECURITY,
  auditRequired: category === NotificationCategory.SECURITY || category === NotificationCategory.ADMINISTRATION,
  mandatory: category === NotificationCategory.SECURITY,
})) as NotificationDefinition[];

@Injectable()
export class NotificationRegistry {
  definitions() { return definitions; }
  templates() { return defaultTemplates; }
  definition(eventKey: string) { return definitions.find((definition) => definition.eventKey === eventKey); }
  template(templateKey: string) { return defaultTemplates.find((template) => template.templateKey === templateKey); }
}

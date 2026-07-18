import type { NotificationCategory, NotificationChannel, NotificationPriority, NotificationRecipientStrategy, NotificationSeverity } from '../entities/notification.entity';

export interface NotificationEvent {
  eventId: string;
  eventKey: string;
  category: NotificationCategory;
  workspaceId?: string | null;
  tenantId?: string | null;
  actorUserId?: string | null;
  assignedUserId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  recipientUserIds?: string[];
  requiredPermissions?: string[];
  payload: Record<string, unknown>;
  occurredAt?: Date;
  correlationId?: string | null;
}

export interface NotificationTemplate {
  templateKey: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  body?: string;
  actionLabel?: string;
  actionUrl?: string;
  localizationKey?: string;
  requiredVariables: string[];
}

export interface NotificationDefinition {
  eventKey: string;
  category: NotificationCategory;
  displayName: string;
  description: string;
  defaultSeverity: NotificationSeverity;
  supportedChannels: NotificationChannel[];
  defaultChannels: NotificationChannel[];
  recipientStrategy: NotificationRecipientStrategy;
  permissionRequirements: string[];
  templateKeys: Partial<Record<NotificationChannel, string>>;
  deduplicationPolicy: 'EVENT_RECIPIENT_ENTITY' | 'EVENT_RECIPIENT_OCCURRENCE';
  deliveryPriority: NotificationPriority;
  expirationMs?: number;
  actionMetadata?: Record<string, unknown>;
  preferenceEligible: boolean;
  auditRequired: boolean;
  mandatory?: boolean;
}

export interface NotificationRecipient {
  userId: string;
  email?: string | null;
  workspaceId?: string | null;
}

export interface NotificationChannelPayload {
  notificationId: string;
  eventId: string;
  recipient: NotificationRecipient;
  title: string;
  message: string;
  body?: string | null;
  actionUrl?: string | null;
  metadata: Record<string, unknown>;
}

export interface NotificationChannelResult {
  delivered: boolean;
  providerReference?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  retryable?: boolean;
}

export interface NotificationChannelAdapter {
  readonly channel: NotificationChannel;
  isEnabled(): boolean;
  send(payload: NotificationChannelPayload): Promise<NotificationChannelResult>;
}

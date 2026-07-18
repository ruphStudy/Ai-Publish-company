import { NotificationChannel } from '../entities/notification.entity';

export interface NotificationPolicy {
  enabledChannels: NotificationChannel[];
  queueName: string;
  defaultExpirationMs: number;
  retentionDays: number;
  deliveryRetentionDays: number;
  retryLimit: number;
  retryDelayMs: number;
  timeoutMs: number;
  concurrency: number;
  batchSize: number;
  baseApplicationUrl: string;
  senderIdentity: string;
  webhookSigningAlgorithm: 'HMAC-SHA256';
  webhookTimestampToleranceMs: number;
  blockedWebhookProtocols: string[];
  blockedWebhookHosts: string[];
}

export const notificationDefaultPolicy: NotificationPolicy = {
  enabledChannels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.WEBHOOK],
  queueName: 'notifications',
  defaultExpirationMs: 30 * 86_400_000,
  retentionDays: 90,
  deliveryRetentionDays: 30,
  retryLimit: 3,
  retryDelayMs: 60_000,
  timeoutMs: 10_000,
  concurrency: 5,
  batchSize: 50,
  baseApplicationUrl: 'http://localhost:5173',
  senderIdentity: 'APC Notifications',
  webhookSigningAlgorithm: 'HMAC-SHA256',
  webhookTimestampToleranceMs: 300_000,
  blockedWebhookProtocols: ['file:', 'ftp:'],
  blockedWebhookHosts: ['localhost', '127.0.0.1', '0.0.0.0', '::1'],
};

import { Injectable } from '@nestjs/common';
import { createHmac, randomUUID } from 'crypto';
import { isIP } from 'net';
import { NotificationChannel } from '../entities/notification.entity';
import type { NotificationChannelAdapter, NotificationChannelPayload, NotificationChannelResult } from '../interfaces/notification.interface';
import { notificationDefaultPolicy } from '../config/notification.config';

@Injectable()
export class InAppNotificationAdapter implements NotificationChannelAdapter {
  readonly channel = NotificationChannel.IN_APP;
  isEnabled() { return notificationDefaultPolicy.enabledChannels.includes(this.channel); }
  async send(): Promise<NotificationChannelResult> { return { delivered: true, providerReference: `in-app-${randomUUID()}` }; }
}

@Injectable()
export class EmailNotificationAdapter implements NotificationChannelAdapter {
  readonly channel = NotificationChannel.EMAIL;
  isEnabled() { return notificationDefaultPolicy.enabledChannels.includes(this.channel); }
  async send(payload: NotificationChannelPayload): Promise<NotificationChannelResult> {
    if (!payload.recipient.email) return { delivered: false, failureCode: 'EMAIL_RECIPIENT_MISSING', failureMessage: 'Email recipient is unavailable', retryable: false };
    return { delivered: true, providerReference: `email-${randomUUID()}` };
  }
}

@Injectable()
export class WebhookNotificationAdapter implements NotificationChannelAdapter {
  readonly channel = NotificationChannel.WEBHOOK;
  isEnabled() { return notificationDefaultPolicy.enabledChannels.includes(this.channel); }
  sign(payload: string, secret: string, timestamp: string) { return createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex'); }
  validateTarget(url: string) {
    const target = new URL(url);
    if (process.env.NODE_ENV === 'production' && target.protocol !== 'https:') return false;
    if (!['https:', 'http:'].includes(target.protocol)) return false;
    const host = target.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost')) return process.env.NODE_ENV !== 'production';
    if (isIP(host)) {
      if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return process.env.NODE_ENV !== 'production';
      if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) return process.env.NODE_ENV !== 'production';
    }
    return true;
  }
  async send(): Promise<NotificationChannelResult> { return { delivered: true, providerReference: `webhook-${randomUUID()}` }; }
}

@Injectable()
export class NotificationChannelAdapterRegistry {
  constructor(private readonly inApp: InAppNotificationAdapter, private readonly email: EmailNotificationAdapter, private readonly webhook: WebhookNotificationAdapter) {}
  adapters() { return [this.inApp, this.email, this.webhook]; }
  resolve(channel: NotificationChannel) { return this.adapters().find((adapter) => adapter.channel === channel); }
}

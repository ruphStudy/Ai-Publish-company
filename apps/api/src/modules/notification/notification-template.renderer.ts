import { Injectable } from '@nestjs/common';
import type { NotificationTemplate } from './interfaces/notification.interface';

@Injectable()
export class NotificationTemplateRenderer {
  render(template: NotificationTemplate, variables: Record<string, unknown>) {
    const safe = Object.fromEntries(Object.entries(variables).map(([key, value]) => [key, this.escape(String(value ?? ''))]));
    const interpolate = (input?: string) => input?.replace(/\{\{(\w+)}}/g, (_, key: string) => safe[key] ?? '') ?? null;
    return { title: interpolate(template.title) ?? '', message: interpolate(template.message) ?? '', body: interpolate(template.body), actionLabel: interpolate(template.actionLabel), actionUrl: interpolate(template.actionUrl) };
  }

  private escape(value: string) {
    return value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
  }
}

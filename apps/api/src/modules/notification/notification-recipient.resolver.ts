import { Injectable } from '@nestjs/common';
import type { NotificationDefinition, NotificationEvent, NotificationRecipient } from './interfaces/notification.interface';
import { NotificationRecipientStrategy } from './entities/notification.entity';

@Injectable()
export class NotificationRecipientResolver {
  async resolve(event: NotificationEvent, definition: NotificationDefinition): Promise<NotificationRecipient[]> {
    const workspaceId = event.workspaceId ?? null;
    const explicit = [...new Set(event.recipientUserIds ?? [])].map((userId) => ({ userId, workspaceId }));
    if (definition.recipientStrategy === NotificationRecipientStrategy.CURRENT_USER && event.actorUserId) return [{ userId: event.actorUserId, workspaceId }];
    if (definition.recipientStrategy === NotificationRecipientStrategy.ASSIGNED_USER && event.assignedUserId) return [{ userId: event.assignedUserId, workspaceId }];
    if (definition.recipientStrategy === NotificationRecipientStrategy.SYSTEM_ADMINISTRATORS && explicit.length) return explicit;
    return explicit;
  }
}

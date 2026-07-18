import { Injectable } from '@nestjs/common';
import { NotificationChannel } from './entities/notification.entity';
import type { NotificationQueryDto } from './dto/notification.dto';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationQueryService {
  constructor(private readonly notifications: NotificationService) {}

  list(userId: string, query: NotificationQueryDto) {
    return this.notifications.list(userId, query);
  }

  unreadCount(userId: string, workspaceId?: string) {
    return this.notifications.unreadCount(userId, workspaceId);
  }

  deliveryHistory(query: { notificationId?: string; workspaceId?: string; channel?: NotificationChannel; page?: number; limit?: number }) {
    return this.notifications.deliveryHistory(query);
  }
}

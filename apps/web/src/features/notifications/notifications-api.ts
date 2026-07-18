import { api } from '@/lib/api-client';

export interface NotificationItem {
  notificationId: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED' | 'DISMISSED' | 'EXPIRED';
  actionUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
}

export const notificationQueryKeys = {
  list: ['notifications', 'list'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export async function fetchNotifications() {
  const { data } = await api.get<NotificationListResponse>('/notifications', { params: { limit: 8 } });
  return data;
}

export async function fetchUnreadCount() {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/notifications/mark-all-read');
  return data;
}

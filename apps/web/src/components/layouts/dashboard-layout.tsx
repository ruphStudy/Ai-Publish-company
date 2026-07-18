import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Footer } from './footer';
import { Toaster } from '@/components/ui/toaster';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, notificationQueryKeys } from '@/features/notifications/notifications-api';
import { useAuth } from '@/features/auth/auth-provider';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAuth();
  const notificationsQuery = useQuery({ queryKey: notificationQueryKeys.list, queryFn: fetchNotifications, refetchInterval: 60000 });
  const invalidateNotifications = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
  const markRead = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidateNotifications });
  const markAllRead = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidateNotifications });
  const notifications = (notificationsQuery.data?.items ?? []).map((item) => ({
    id: item.notificationId,
    title: item.title,
    description: item.message,
    time: item.createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt)) : '',
    read: item.status !== 'UNREAD',
    path: item.actionUrl && item.actionUrl.startsWith('/') ? item.actionUrl : undefined,
  }));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={{
            name: `${auth.user?.firstName ?? ''} ${auth.user?.lastName ?? ''}`.trim() || auth.user?.email || 'User',
            email: auth.user?.email,
            role: auth.user?.roles?.join(', '),
            initials: `${auth.user?.firstName?.[0] ?? ''}${auth.user?.lastName?.[0] ?? ''}`.toUpperCase() || auth.user?.email?.slice(0, 2).toUpperCase(),
          }}
          notifications={notifications}
          onNotificationRead={(id) => markRead.mutate(id)}
          onNotificationOpen={(id) => {
            const notification = notifications.find((item) => item.id === id);
            if (notification?.path) navigate(notification.path);
          }}
          onAllNotificationsRead={() => markAllRead.mutate()}
          onSettingsClick={() => navigate('/settings')}
          onSignOut={async () => {
            await auth.logout();
            navigate('/auth/login', { replace: true });
          }}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900" id="main-content">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      <Toaster />
    </div>
  );
}

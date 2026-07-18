import type { PermissionContext } from '../lib/permissions';
import { useAuth } from '@/features/auth/auth-provider';

export function useDashboardPermissions(): PermissionContext {
  const { user } = useAuth();
  return { roles: user?.roles ?? [], permissions: user?.permissions ?? [], featureFlags: {} };
}

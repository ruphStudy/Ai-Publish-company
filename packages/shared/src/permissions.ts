export enum AppPermission {
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_FINANCIAL_READ = 'analytics:financial:read',
  BOOKS_READ = 'books:read',
  BOOKS_CREATE = 'books:create',
  CATEGORIES_READ = 'categories:read',
  CATEGORIES_WRITE = 'categories:write',
  CATEGORIES_DELETE = 'categories:delete',
  PUBLISHING_READ = 'publishing:read',
  PUBLISHING_WRITE = 'publishing:write',
  OPPORTUNITIES_READ = 'opportunities:read',
  OPPORTUNITIES_WRITE = 'opportunities:write',
  AI_INSIGHTS_READ = 'ai-insights:read',
  JOBS_READ = 'jobs:read',
  JOBS_TRIGGER = 'jobs:trigger',
  JOBS_CANCEL = 'jobs:cancel',
  RECOVERY_READ = 'recovery:read',
  RECOVERY_MANAGE = 'recovery:manage',
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  PLATFORM_READ = 'platform:read',
}

export type AppRole = 'admin' | 'editor' | 'viewer';

export const rolePermissions: Record<AppRole, AppPermission[]> = {
  admin: Object.values(AppPermission),
  editor: [
    AppPermission.ANALYTICS_READ,
    AppPermission.BOOKS_READ,
    AppPermission.BOOKS_CREATE,
    AppPermission.CATEGORIES_READ,
    AppPermission.CATEGORIES_WRITE,
    AppPermission.PUBLISHING_READ,
    AppPermission.PUBLISHING_WRITE,
    AppPermission.OPPORTUNITIES_READ,
    AppPermission.OPPORTUNITIES_WRITE,
    AppPermission.AI_INSIGHTS_READ,
    AppPermission.JOBS_READ,
    AppPermission.JOBS_TRIGGER,
    AppPermission.JOBS_CANCEL,
    AppPermission.RECOVERY_READ,
    AppPermission.SETTINGS_READ,
    AppPermission.SETTINGS_UPDATE,
    AppPermission.PLATFORM_READ,
  ],
  viewer: [
    AppPermission.ANALYTICS_READ,
    AppPermission.BOOKS_READ,
    AppPermission.CATEGORIES_READ,
    AppPermission.PUBLISHING_READ,
    AppPermission.OPPORTUNITIES_READ,
    AppPermission.AI_INSIGHTS_READ,
    AppPermission.JOBS_READ,
    AppPermission.RECOVERY_READ,
    AppPermission.SETTINGS_READ,
    AppPermission.PLATFORM_READ,
  ],
};

export function permissionsForRoles(roles: readonly string[] = []): AppPermission[] {
  return [...new Set(roles.flatMap((role) => rolePermissions[role as AppRole] ?? []))];
}

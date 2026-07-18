import type { DashboardDefinition, DashboardPermission, DashboardWidgetDefinition } from '../types';

export interface PermissionContext {
  permissions?: DashboardPermission[];
  roles?: string[];
  featureFlags?: Record<string, boolean>;
}

export function hasPermissions(required: DashboardPermission[] | undefined, context?: PermissionContext): boolean {
  if (!required?.length) return true;
  const granted = new Set([...(context?.permissions ?? []), ...(context?.roles ?? [])]);
  return required.every((permission) => granted.has(permission));
}

export function isFeatureEnabled(featureFlag: string | undefined, context?: PermissionContext): boolean {
  if (!featureFlag) return true;
  return context?.featureFlags?.[featureFlag] !== false;
}

export function canViewDashboard(definition: DashboardDefinition, context?: PermissionContext): boolean {
  return definition.enabled && hasPermissions(definition.requiredPermissions, context) && isFeatureEnabled(definition.featureFlag, context);
}

export function canViewWidget(widget: DashboardWidgetDefinition, context?: PermissionContext): boolean {
  return hasPermissions(widget.requiredPermissions, context) && isFeatureEnabled(widget.featureFlag, context);
}

export function canExport(requiredPermissions: DashboardPermission[] | undefined, context?: PermissionContext): boolean {
  return hasPermissions(requiredPermissions, context);
}

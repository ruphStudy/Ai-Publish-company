import type { DashboardKey, DashboardPreference } from '../types';

const key = 'analytics:dashboard-preferences';

export function readDashboardPreferences(): DashboardPreference {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as DashboardPreference : {};
  } catch {
    return {};
  }
}

export function writeDashboardPreferences(preferences: DashboardPreference) {
  localStorage.setItem(key, JSON.stringify(preferences));
}

export function mergeDashboardPreferences(preferences: Partial<DashboardPreference>) {
  const next = { ...readDashboardPreferences(), ...preferences };
  writeDashboardPreferences(next);
  return next;
}

export function readDashboardPreferenceFor(keyName: keyof DashboardPreference, dashboardKey?: DashboardKey) {
  const preferences = readDashboardPreferences();
  if (keyName === 'defaultDashboard' && dashboardKey) return dashboardKey;
  return preferences[keyName];
}

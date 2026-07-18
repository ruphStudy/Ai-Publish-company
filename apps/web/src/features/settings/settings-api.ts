import { api } from '@/lib/api-client';
import type { ResolvedSetting, SettingCategory, SettingCategoryItem, SettingDefinition, SettingScope, SettingValue } from './types';

export const settingsQueryKeys = {
  categories: ['settings', 'categories'] as const,
  registry: (category?: SettingCategory, search?: string) => ['settings', 'registry', category ?? 'all', search ?? ''] as const,
  values: (category?: SettingCategory, search?: string) => ['settings', 'values', category ?? 'all', search ?? ''] as const,
};

export async function fetchSettingCategories() {
  const { data } = await api.get<SettingCategoryItem[]>('/settings/categories');
  return data;
}

export async function fetchSettingRegistry(category?: SettingCategory, search?: string) {
  const { data } = await api.get<SettingDefinition[]>('/settings/registry', { params: { category, search } });
  return data;
}

export async function fetchSettings(category?: SettingCategory, search?: string) {
  const { data } = await api.get<{ items: ResolvedSetting[]; total: number }>('/settings', { params: { category, search } });
  return data;
}

export async function updateSetting(key: string, payload: { scope: SettingScope; scopeId?: string | null; value: SettingValue }) {
  const { data } = await api.patch(`/settings/${encodeURIComponent(key)}`, payload);
  return data;
}

export async function resetSettingToInherited(key: string, payload: { scope: SettingScope; scopeId?: string | null }) {
  const { data } = await api.patch(`/settings/${encodeURIComponent(key)}/reset-inherited`, payload);
  return data;
}

import { api } from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  status: 'active' | 'inactive';
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListResponse {
  data: Category[];
  meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export const categoryQueryKeys = {
  list: (params: Record<string, unknown>) => ['categories', params] as const,
};

export async function fetchCategories(params: Record<string, unknown>) {
  const { data } = await api.get<CategoryListResponse>('/categories', { params });
  return data;
}

export async function createCategory(payload: Partial<Category>) {
  const { data } = await api.post<Category>('/categories', payload);
  return data;
}

export async function updateCategory(id: string, payload: Partial<Category>) {
  const { data } = await api.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
}

export async function restoreCategory(id: string) {
  const { data } = await api.patch<Category>(`/categories/${id}/restore`);
  return data;
}

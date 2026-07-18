import { api } from '@/lib/api-client';

export interface BookProject {
  id: string;
  projectCode: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  categoryId: string;
  niche?: string | null;
  microNiche?: string | null;
  language: string;
  targetMarket: string;
  targetAudience?: string | null;
  writingStyle?: string | null;
  tone?: string | null;
  objective?: string | null;
  estimatedWordCount?: number | null;
  estimatedChapterCount?: number | null;
  status: string;
  progress: number;
  currentStage: string;
  updatedAt: string;
  createdAt: string;
  version?: number;
}

export interface ProjectListResponse {
  data: BookProject[];
  meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export interface ProjectPayload {
  title: string;
  subtitle?: string;
  description?: string;
  categoryId: string;
  niche?: string;
  microNiche?: string;
  language: string;
  targetMarket: string;
  targetAudience?: string;
  writingStyle?: string;
  tone?: string;
  objective?: string;
  estimatedWordCount?: number;
  estimatedChapterCount?: number;
  targetPlatforms?: string[];
}

export const projectQueryKeys = {
  list: (params: Record<string, unknown>) => ['projects', params] as const,
  detail: (id?: string) => ['projects', id] as const,
};

export async function fetchProjects(params: Record<string, unknown>) {
  const { data } = await api.get<ProjectListResponse>('/book-projects', { params });
  return data;
}

export async function fetchProject(id: string) {
  const { data } = await api.get<BookProject>(`/book-projects/${id}`);
  return data;
}

export async function createProject(payload: ProjectPayload) {
  const { data } = await api.post<BookProject>('/book-projects', payload);
  return data;
}

export async function updateProject(id: string, payload: Partial<ProjectPayload> & { status?: string; currentStage?: string; progress?: number }) {
  const { data } = await api.patch<BookProject>(`/book-projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string) {
  await api.delete(`/book-projects/${id}`);
}

import { api } from '@/lib/api-client';

export interface DashboardSummary {
  kpis: {
    categories: { value: number };
    projects: { value: number; active: number };
    publishingQueue: { value: number; running: number; failed: number };
    aiInsights: { value: number };
  };
  recentProjects: Array<{ id: string; projectCode: string; title: string; status: string; currentStage: string; progress: number; updatedAt: string }>;
  recentInsights: Array<{ id: string; title: string; summary: string; category: string; priority: string; confidence: number; generatedAt: string }>;
  generatedAt: string;
}

export const dashboardQueryKeys = { summary: ['dashboard', 'summary'] as const };

export async function fetchDashboardSummary() {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary');
  return data;
}

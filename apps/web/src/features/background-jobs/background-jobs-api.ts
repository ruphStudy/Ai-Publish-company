import { api } from '@/lib/api-client';
import type { JobDefinition, JobExecution, JobSchedule } from './types';

export const backgroundJobQueryKeys = {
  definitions: ['background-jobs', 'definitions'] as const,
  executions: (status?: string) => ['background-jobs', 'executions', status ?? 'all'] as const,
  schedules: ['background-jobs', 'schedules'] as const,
  health: ['background-jobs', 'health'] as const,
};

export async function fetchJobDefinitions() {
  const { data } = await api.get<JobDefinition[]>('/background-jobs/definitions');
  return data;
}

export async function fetchJobExecutions(status?: string) {
  const { data } = await api.get<{ items: JobExecution[]; total: number }>('/background-jobs/executions', { params: { status: status === 'ALL' ? undefined : status } });
  return data;
}

export async function fetchJobSchedules() {
  const { data } = await api.get<{ items: JobSchedule[]; total: number }>('/background-jobs/schedules');
  return data;
}

export async function fetchQueueHealth() {
  const { data } = await api.get('/background-jobs/health/queues');
  return data;
}

export async function triggerJob(jobKey: string) {
  const { data } = await api.post('/background-jobs/trigger', { jobKey, payload: {} });
  return data;
}

export async function retryJob(executionId: string) {
  const { data } = await api.post(`/background-jobs/executions/${executionId}/retry`, {});
  return data;
}

export async function cancelJob(executionId: string) {
  const { data } = await api.post(`/background-jobs/executions/${executionId}/cancel`, { reason: 'Cancelled from operations UI' });
  return data;
}

export async function enableSchedule(scheduleId: string) {
  const { data } = await api.patch(`/background-jobs/schedules/${scheduleId}/enable`);
  return data;
}

export async function disableSchedule(scheduleId: string) {
  const { data } = await api.patch(`/background-jobs/schedules/${scheduleId}/disable`);
  return data;
}

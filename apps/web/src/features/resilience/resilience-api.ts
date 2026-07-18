import { api } from '@/lib/api-client';
import type { CircuitStatus, RecoveryState, ResiliencePolicy } from './types';

export const resilienceQueryKeys = {
  status: ['resilience', 'status'] as const,
  policies: ['resilience', 'policies'] as const,
  history: ['resilience', 'history'] as const,
  circuits: ['resilience', 'circuits'] as const,
};

export async function fetchRecoveryStatus() {
  const { data } = await api.get<{ status: string; failedOperations: number; openCircuits: number }>('/resilience/status');
  return data;
}

export async function fetchResiliencePolicies() {
  const { data } = await api.get<ResiliencePolicy[]>('/resilience/policies');
  return data;
}

export async function fetchRecoveryHistory() {
  const { data } = await api.get<{ items: RecoveryState[]; total: number }>('/resilience/history');
  return data;
}

export async function fetchCircuitStatus() {
  const { data } = await api.get<{ items: CircuitStatus[]; total: number }>('/resilience/circuits');
  return data;
}

export async function retryRecovery(recoveryId: string) {
  const { data } = await api.post(`/resilience/recoveries/${recoveryId}/retry`, {});
  return data;
}

export async function recoverRecovery(recoveryId: string) {
  const { data } = await api.post(`/resilience/recoveries/${recoveryId}/recover`, { note: 'Manual recovery from operations UI' });
  return data;
}

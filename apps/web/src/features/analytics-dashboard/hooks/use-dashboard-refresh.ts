import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DashboardKey, DashboardRefreshState } from '../types';
import { analyticsQueryKeys } from '../lib/query-keys';

export function useDashboardRefresh(dashboardKey: DashboardKey) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<DashboardRefreshState>('IDLE');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>();

  const refresh = useCallback(async () => {
    if (state === 'REFRESHING') return;
    setState('REFRESHING');
    try {
      await queryClient.invalidateQueries({ queryKey: [...analyticsQueryKeys.all, dashboardKey] });
      setLastRefreshedAt(new Date().toISOString());
      setState('SUCCESS');
    } catch {
      setState('FAILED');
    }
  }, [dashboardKey, queryClient, state]);

  return { state, lastRefreshedAt, refresh };
}

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { DashboardDefinition, DashboardFilters } from '../types';
import { parseDashboardFilters, serializeDashboardFilters } from '../lib/url-state';

export function useDashboardState(definition: DashboardDefinition) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = useMemo<DashboardFilters>(() => ({ ...definition.defaultFilters, scope: definition.defaultScope, period: definition.defaultPeriod, comparisonMode: definition.defaultComparisonMode }), [definition]);
  const appliedFilters = useMemo(() => parseDashboardFilters(searchParams, defaults), [searchParams, defaults]);
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>(appliedFilters);

  const applyFilters = useCallback((next: DashboardFilters = draftFilters) => {
    const supportedEntries = Object.entries(next).filter(([key]) => definition.supportedFilters.includes(key as keyof DashboardFilters) || ['scope', 'period', 'comparisonMode', 'dateRange'].includes(key));
    setSearchParams(serializeDashboardFilters(Object.fromEntries(supportedEntries) as DashboardFilters, defaults), { replace: false });
    setDraftFilters(next);
  }, [definition.supportedFilters, draftFilters, defaults, setSearchParams]);

  const resetFilters = useCallback(() => {
    setDraftFilters(defaults);
    setSearchParams(serializeDashboardFilters(defaults, defaults), { replace: false });
  }, [defaults, setSearchParams]);

  const clearFilter = useCallback((key: keyof DashboardFilters) => {
    const next = { ...draftFilters };
    delete next[key];
    setDraftFilters(next);
  }, [draftFilters]);

  return { appliedFilters, draftFilters, setDraftFilters, applyFilters, resetFilters, clearFilter };
}

import { createContext, useContext } from 'react';
import type { DashboardDefinition, DashboardFilters } from '../types';

export interface DashboardFilterContextValue {
  definition: DashboardDefinition;
  appliedFilters: DashboardFilters;
  draftFilters: DashboardFilters;
  setDraftFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  applyFilters: (filters?: DashboardFilters) => void;
  resetFilters: () => void;
  clearFilter: (key: keyof DashboardFilters) => void;
}

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(null);

export function DashboardFilterProvider({ value, children }: { value: DashboardFilterContextValue; children: React.ReactNode }) {
  return <DashboardFilterContext.Provider value={value}>{children}</DashboardFilterContext.Provider>;
}

export function useDashboardFilters() {
  const context = useContext(DashboardFilterContext);
  if (!context) throw new Error('useDashboardFilters must be used within DashboardFilterProvider');
  return context;
}

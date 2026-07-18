import type { DashboardComparisonMode, DashboardDatePeriod, DashboardDateRange } from '../types';

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function resolveDateRange(period: DashboardDatePeriod, custom?: DashboardDateRange, now = new Date()): DashboardDateRange {
  if (period === 'CUSTOM') return custom ?? {};
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = addDays(today, -today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const ranges: Record<DashboardDatePeriod, DashboardDateRange> = {
    TODAY: { from: iso(today), to: iso(today) },
    YESTERDAY: { from: iso(addDays(today, -1)), to: iso(addDays(today, -1)) },
    LAST_7_DAYS: { from: iso(addDays(today, -6)), to: iso(today) },
    LAST_30_DAYS: { from: iso(addDays(today, -29)), to: iso(today) },
    LAST_90_DAYS: { from: iso(addDays(today, -89)), to: iso(today) },
    CURRENT_WEEK: { from: iso(startOfWeek), to: iso(today) },
    PREVIOUS_WEEK: { from: iso(addDays(startOfWeek, -7)), to: iso(addDays(startOfWeek, -1)) },
    CURRENT_MONTH: { from: iso(startOfMonth), to: iso(today) },
    PREVIOUS_MONTH: { from: iso(new Date(today.getFullYear(), today.getMonth() - 1, 1)), to: iso(new Date(today.getFullYear(), today.getMonth(), 0)) },
    CURRENT_QUARTER: { from: iso(startOfQuarter), to: iso(today) },
    PREVIOUS_QUARTER: { from: iso(new Date(startOfQuarter.getFullYear(), startOfQuarter.getMonth() - 3, 1)), to: iso(addDays(startOfQuarter, -1)) },
    CURRENT_YEAR: { from: iso(startOfYear), to: iso(today) },
    PREVIOUS_YEAR: { from: iso(new Date(today.getFullYear() - 1, 0, 1)), to: iso(new Date(today.getFullYear() - 1, 11, 31)) },
    LIFETIME: {},
    CUSTOM: custom ?? {},
  };
  return ranges[period];
}

export function resolveComparisonRange(mode: DashboardComparisonMode, current: DashboardDateRange, custom?: DashboardDateRange): DashboardDateRange | undefined {
  if (mode === 'NONE') return undefined;
  if (mode === 'CUSTOM') return custom;
  if (!current.from || !current.to) return undefined;
  const from = new Date(current.from);
  const to = new Date(current.to);
  const length = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
  if (mode === 'PREVIOUS_YEAR') return { from: iso(new Date(from.getFullYear() - 1, from.getMonth(), from.getDate())), to: iso(new Date(to.getFullYear() - 1, to.getMonth(), to.getDate())) };
  if (mode === 'PREVIOUS_PERIOD' || mode === 'PREVIOUS_CALENDAR_PERIOD') return { from: iso(addDays(from, -length)), to: iso(addDays(from, -1)) };
  return undefined;
}

import type { DashboardDateRange, DashboardDataFreshness, TrendValue } from '../types';
import { getPlatformMarketplace, getPlatformProvider, platformDefaults } from '@/features/platform-registry';

const unavailable = '—';

export function formatNumber(value?: number | null, options?: Intl.NumberFormatOptions): string {
  return value === null || value === undefined || Number.isNaN(value) ? unavailable : new Intl.NumberFormat(undefined, options).format(value);
}

export function formatCompactNumber(value?: number | null): string {
  return formatNumber(value, { notation: 'compact', maximumFractionDigits: 1 });
}

export function formatCurrency(value?: number | null, currency = platformDefaults.reportingCurrency): string {
  return formatNumber(value, { style: 'currency', currency, maximumFractionDigits: 2 });
}

export function formatCompactCurrency(value?: number | null, currency = platformDefaults.reportingCurrency): string {
  return formatNumber(value, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 });
}

export function formatPercentage(value?: number | null): string {
  return value === null || value === undefined || Number.isNaN(value) ? unavailable : `${formatNumber(value, { maximumFractionDigits: 1 })}%`;
}

export function formatScore(value?: number | null): string {
  return value === null || value === undefined ? unavailable : `${formatNumber(value, { maximumFractionDigits: 0 })}/100`;
}

export function formatConfidence(value?: number | null): string {
  return formatPercentage(value);
}

export function formatRatio(numerator?: number | null, denominator?: number | null): string {
  if (!numerator || !denominator) return unavailable;
  return `${formatNumber(numerator)}:${formatNumber(denominator)}`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return unavailable;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? unavailable : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function formatTime(value?: string | Date | null): string {
  if (!value) return unavailable;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? unavailable : new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date);
}

export function formatDateRange(range?: DashboardDateRange): string {
  if (!range?.from && !range?.to) return unavailable;
  return `${formatDate(range.from)} – ${formatDate(range.to)}`;
}

export function formatDuration(ms?: number | null): string {
  if (ms === null || ms === undefined) return unavailable;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.round(minutes / 60)}h`;
}

export function formatLabel(value?: string | null): string {
  if (!value) return unavailable;
  return value.toLowerCase().split(/[_-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function formatProviderLabel(value?: string | null): string {
  return getPlatformProvider(value)?.displayName ?? formatLabel(value);
}

export function formatMarketplaceLabel(value?: string | null): string {
  return getPlatformMarketplace(value)?.displayName ?? formatLabel(value);
}
export const formatCountryLabel = formatLabel;
export const formatTerritoryLabel = formatLabel;
export const formatFormatLabel = formatLabel;
export const formatStatusLabel = formatLabel;
export const formatPriorityLabel = formatLabel;

export function formatTrendLabel(trend?: TrendValue): string {
  if (!trend) return unavailable;
  if (trend.label) return trend.label;
  if (trend.percentageChange !== undefined) return `${trend.direction === 'UP' ? '+' : trend.direction === 'DOWN' ? '-' : ''}${formatPercentage(Math.abs(trend.percentageChange))}`;
  if (trend.absoluteChange !== undefined) return `${trend.direction === 'UP' ? '+' : trend.direction === 'DOWN' ? '-' : ''}${formatNumber(Math.abs(trend.absoluteChange))}`;
  return formatLabel(trend.direction);
}

export function formatFreshness(value?: DashboardDataFreshness): string {
  return formatLabel(value ?? 'UNKNOWN');
}

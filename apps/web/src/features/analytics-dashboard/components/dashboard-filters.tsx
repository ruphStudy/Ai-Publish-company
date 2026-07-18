import { Calendar, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { formatLabel } from '../lib/formatters';
import type { DashboardComparisonMode, DashboardDatePeriod, DashboardFilterKey, DashboardFilters } from '../types';
import { useDashboardFilters } from './dashboard-filter-provider';

function supports(key: DashboardFilterKey) {
  return useDashboardFilters().definition.supportedFilters.includes(key);
}

function updateFilter(filters: DashboardFilters, key: DashboardFilterKey, value: unknown): DashboardFilters {
  return { ...filters, [key]: value || undefined };
}

export function DashboardDateRangePicker() {
  const { definition, draftFilters, setDraftFilters } = useDashboardFilters();
  return (
    <Select value={draftFilters.period ?? definition.defaultPeriod} onValueChange={(value) => setDraftFilters((current) => updateFilter(current, 'period', value as DashboardDatePeriod))}>
      <SelectTrigger className="w-full md:w-44" aria-label="Date period"><Calendar className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
      <SelectContent>{definition.supportedPeriods.map((period) => <SelectItem key={period} value={period}>{formatLabel(period)}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function DashboardComparisonPicker() {
  const { definition, draftFilters, setDraftFilters } = useDashboardFilters();
  return (
    <Select value={draftFilters.comparisonMode ?? definition.defaultComparisonMode} onValueChange={(value) => setDraftFilters((current) => updateFilter(current, 'comparisonMode', value as DashboardComparisonMode))}>
      <SelectTrigger className="w-full md:w-52" aria-label="Comparison period"><SelectValue /></SelectTrigger>
      <SelectContent>{definition.supportedComparisonModes.map((mode) => <SelectItem key={mode} value={mode}>{formatLabel(mode)}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function DashboardScopeFilter() {
  const { definition, draftFilters, setDraftFilters } = useDashboardFilters();
  return (
    <Select value={draftFilters.scope ?? definition.defaultScope} onValueChange={(value) => setDraftFilters((current) => updateFilter(current, 'scope', value))}>
      <SelectTrigger className="w-full md:w-40" aria-label="Dashboard scope"><SelectValue /></SelectTrigger>
      <SelectContent>{definition.supportedScopes.map((scope) => <SelectItem key={scope} value={scope}>{formatLabel(scope)}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function TextFilter({ filterKey, label, placeholder }: { filterKey: DashboardFilterKey; label: string; placeholder?: string }) {
  const { draftFilters, setDraftFilters } = useDashboardFilters();
  if (!supports(filterKey)) return null;
  const value = draftFilters[filterKey];
  return (
    <div className="grid gap-1">
      <Label className="text-xs">{label}</Label>
      <Input value={typeof value === 'string' ? value : ''} placeholder={placeholder ?? label} onChange={(event) => setDraftFilters((current) => updateFilter(current, filterKey, event.target.value))} />
    </div>
  );
}

export function DashboardProviderFilter() { return <TextFilter filterKey="providerKeys" label="Provider" />; }
export function DashboardMarketplaceFilter() { return <TextFilter filterKey="marketplaceIds" label="Marketplace" />; }
export function DashboardCountryFilter() { return <TextFilter filterKey="countryCodes" label="Country" />; }
export function DashboardTerritoryFilter() { return <TextFilter filterKey="territoryCodes" label="Territory" />; }
export function DashboardFormatFilter() { return <TextFilter filterKey="formats" label="Format" />; }
export function DashboardBookFilter() { return <TextFilter filterKey="bookIds" label="Book" />; }
export function DashboardEditionFilter() { return <TextFilter filterKey="editionIds" label="Edition" />; }
export function DashboardAuthorFilter() { return <TextFilter filterKey="authorIds" label="Author" />; }
export function DashboardSeriesFilter() { return <TextFilter filterKey="seriesIds" label="Series" />; }
export function DashboardCurrencyFilter() { return <TextFilter filterKey="currencyCode" label="Currency" />; }
export function DashboardTransactionTypeFilter() { return <TextFilter filterKey="transactionTypes" label="Transaction type" />; }
export function DashboardRoyaltyTypeFilter() { return <TextFilter filterKey="royaltyTypes" label="Royalty type" />; }
export function DashboardPaymentStatusFilter() { return <TextFilter filterKey="paymentStatuses" label="Payment status" />; }
export function DashboardDimensionFilters() { return <><DashboardProviderFilter /><DashboardMarketplaceFilter /><DashboardCountryFilter /><DashboardTerritoryFilter /><DashboardFormatFilter /></>; }
export function DashboardEntityFilters() { return <><DashboardBookFilter /><DashboardEditionFilter /><DashboardAuthorFilter /><DashboardSeriesFilter /></>; }

export function DashboardFilterControls() {
  const { applyFilters, resetFilters } = useDashboardFilters();
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
      <DashboardScopeFilter />
      <DashboardDateRangePicker />
      <DashboardComparisonPicker />
      <DashboardCurrencyFilter />
      <DashboardDimensionFilters />
      <DashboardEntityFilters />
      <DashboardTransactionTypeFilter />
      <DashboardRoyaltyTypeFilter />
      <DashboardPaymentStatusFilter />
      <TextFilter filterKey="search" label="Search" />
      <div className="flex items-end gap-2">
        <Button onClick={() => applyFilters()}><Filter className="mr-2 h-4 w-4" />Apply</Button>
        <Button variant="outline" onClick={resetFilters}><X className="mr-2 h-4 w-4" />Reset</Button>
      </div>
    </div>
  );
}

export function DashboardFilterBar() {
  return <div className="hidden rounded-lg border bg-background p-4 md:block"><DashboardFilterControls /></div>;
}

export function DashboardFilterDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline" className="md:hidden"><SlidersHorizontal className="mr-2 h-4 w-4" />Filters</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Dashboard filters</DrawerTitle></DrawerHeader>
        <div className="p-4"><DashboardFilterControls /></div>
      </DrawerContent>
    </Drawer>
  );
}

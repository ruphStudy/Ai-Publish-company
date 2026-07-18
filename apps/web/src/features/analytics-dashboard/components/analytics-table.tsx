import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { WidgetEmptyState, WidgetErrorState, WidgetLoadingState, WidgetPartialDataState } from './dashboard-states';
import type { AnalyticsTableColumn, DashboardDataCompleteness } from '../types';

export function AnalyticsTable<T extends Record<string, unknown>>({ columns, rows, loading, error, completeness, onSort }: { columns: AnalyticsTableColumn<T>[]; rows?: T[]; loading?: boolean; error?: unknown; completeness?: DashboardDataCompleteness; onSort?: (key: string) => void }) {
  if (loading) return <WidgetLoadingState />;
  if (error) return <WidgetErrorState error={error} />;
  if (!rows?.length) return <WidgetEmptyState title="No rows" description="No rows match the selected filters." />;
  return (
    <div className="overflow-x-auto">
      <WidgetPartialDataState completeness={completeness} />
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : undefined}>
                {column.sortable && onSort ? <Button variant="ghost" size="sm" onClick={() => onSort(column.key)}>{column.header}</Button> : column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={String(row.id ?? rowIndex)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : undefined}>
                  {column.render ? column.render(row[column.key] as T[keyof T], row) : String(row[column.key] ?? '—')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { Filter, SortDesc, LayoutGrid, LayoutList } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { OpportunityScoreCard } from '@/components/ai/opportunity-score-card';
import { cn } from '@/lib/utils';

export interface OpportunityItem {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  score: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  competitionLevel?: 'low' | 'medium' | 'high';
  demandLevel?: 'low' | 'medium' | 'high';
  estimatedRevenue?: string;
  keywords?: string[];
}

interface OpportunityGridProps {
  items: OpportunityItem[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  showFilters?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  showLayoutToggle?: boolean;
  onItemOpen?: (item: OpportunityItem) => void;
  onItemAddToQueue?: (item: OpportunityItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onAddNew?: () => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'score-desc', label: 'Score: High to Low' },
  { value: 'score-asc', label: 'Score: Low to High' },
  { value: 'title-asc', label: 'Title: A-Z' },
  { value: 'category-asc', label: 'Category: A-Z' },
];

export function OpportunityGrid({
  items,
  isLoading = false,
  columns = 3,
  showFilters = true,
  showSearch = true,
  showSort = true,
  showLayoutToggle = false,
  onItemOpen,
  onItemAddToQueue,
  emptyTitle,
  emptyDescription,
  onAddNew,
  className,
}: OpportunityGridProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score-desc');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const filtered = items
    .filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subcategory?.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score-desc':
          return b.score - a.score;
        case 'score-asc':
          return a.score - b.score;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'category-asc':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const gridColClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  return (
    <div className={cn('space-y-4', className)}>
      {(showSearch || showSort || showFilters || showLayoutToggle) && (
        <div className="flex flex-wrap items-center gap-3">
          {showSearch && (
            <div className="relative flex-1 sm:min-w-64">
              <Input
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3"
                aria-label="Search opportunities"
              />
            </div>
          )}

          {showSort && (
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto gap-2" aria-label="Sort opportunities">
                <SortDesc className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showFilters && (
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          )}

          {showLayoutToggle && (
            <div className="flex rounded-lg border p-0.5">
              <Button
                variant={layout === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setLayout('grid')}
                aria-label="Grid layout"
                aria-pressed={layout === 'grid'}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={layout === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setLayout('list')}
                aria-label="List layout"
                aria-pressed={layout === 'list'}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {filtered.length > 0 && (
            <p className="ml-auto text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className={cn('grid gap-4', gridColClass)}>
          {Array.from({ length: columns * 2 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-1.5 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          preset={search ? 'search' : 'data'}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={onAddNew ? 'Find Opportunities' : undefined}
          onAction={onAddNew}
        />
      ) : (
        <div className={cn('grid gap-4', gridColClass)}>
          {filtered.map((item) => (
            <OpportunityScoreCard
              key={item.id}
              title={item.title}
              category={item.category}
              subcategory={item.subcategory}
              score={item.score}
              trend={item.trend}
              trendValue={item.trendValue}
              competitionLevel={item.competitionLevel}
              demandLevel={item.demandLevel}
              estimatedRevenue={item.estimatedRevenue}
              keywords={item.keywords}
              onOpen={onItemOpen ? () => onItemOpen(item) : undefined}
              onAddToQueue={onItemAddToQueue ? () => onItemAddToQueue(item) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

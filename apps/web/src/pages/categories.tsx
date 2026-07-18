import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, MoreHorizontal, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardPermissions } from '@/features/analytics-dashboard/hooks/use-dashboard-permissions';
import { hasPermissions } from '@/features/analytics-dashboard/lib/permissions';
import { categoryQueryKeys, createCategory, deleteCategory, fetchCategories, restoreCategory, updateCategory, type Category } from '@/features/categories/category-api';

function CategoryForm({ category, onSubmit, onCancel }: { category?: Category | null; onSubmit: (payload: Partial<Category>) => void; onCancel: () => void }) {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [status, setStatus] = useState<Category['status']>(category?.status ?? 'active');
  const [color, setColor] = useState(category?.color ?? '#3B82F6');
  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} /></div>
      <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(event) => setDescription(event.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={(value) => setStatus(value as Category['status'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>Color</Label><Input value={color} onChange={(event) => setColor(event.target.value)} /></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={onCancel}>Cancel</Button><Button onClick={() => onSubmit({ name, description, status, color })} disabled={!name.trim()}>Save</Button></DialogFooter>
    </div>
  );
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const permissions = useDashboardPermissions();
  const canWrite = hasPermissions(['categories:write'], permissions);
  const canDelete = hasPermissions(['categories:delete'], permissions);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const params = useMemo(() => ({ search: search || undefined, status: status === 'all' ? undefined : status, page, limit: 12, sortBy: 'displayOrder', sortOrder: 'asc' }), [search, status, page]);
  const categories = useQuery({ queryKey: categoryQueryKeys.list(params), queryFn: () => fetchCategories(params) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });
  const createMutation = useMutation({ mutationFn: createCategory, onSuccess: () => { invalidate(); setEditing(undefined); } });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<Category> }) => updateCategory(id, payload), onSuccess: () => { invalidate(); setEditing(undefined); } });
  const deleteMutation = useMutation({ mutationFn: deleteCategory, onSuccess: invalidate });
  const restoreMutation = useMutation({ mutationFn: restoreCategory, onSuccess: invalidate });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Categories</h1><p className="text-muted-foreground">Manage publishing categories and subcategories.</p></div>
        {canWrite && <Button className="gap-2" onClick={() => setEditing(null)}><Plus className="h-4 w-4" />Add Category</Button>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search categories..." className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger className="w-40"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
      </div>

      {categories.isLoading && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40" />)}</div>}
      {categories.isError && <Card><CardContent className="py-10 text-center text-destructive">Unable to load categories. <Button variant="link" onClick={() => categories.refetch()}>Retry</Button></CardContent></Card>}
      {!categories.isLoading && !categories.isError && !categories.data?.data.length && <Card><CardContent className="py-10 text-center text-muted-foreground">No categories found.</CardContent></Card>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(categories.data?.data ?? []).map((category) => (
          <Card key={category.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color ?? '#64748b' }} />{category.name}</CardTitle>
                <CardDescription className="flex items-center gap-2"><Badge variant={category.status === 'active' ? 'success' : 'outline'} className="text-xs">{category.status}</Badge><span>{category.slug}</span></CardDescription>
              </div>
              {canWrite && <Button variant="ghost" size="icon" onClick={() => setEditing(category)}><MoreHorizontal className="h-4 w-4" /></Button>}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="min-h-10 text-sm text-muted-foreground">{category.description ?? 'No description provided.'}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Order {category.displayOrder}</span><span>{new Date(category.updatedAt).toLocaleDateString()}</span></div>
              <div className="flex justify-end gap-2">{canDelete && <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(category.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}{canDelete && <Button size="sm" variant="ghost" onClick={() => restoreMutation.mutate(category.id)}><RotateCcw className="mr-2 h-4 w-4" />Restore</Button>}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.data && categories.data.meta.totalPages > 1 && <div className="flex items-center justify-end gap-2"><Button variant="outline" disabled={!categories.data.meta.hasPrevPage} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><span className="text-sm text-muted-foreground">Page {categories.data.meta.page} of {categories.data.meta.totalPages}</span><Button variant="outline" disabled={!categories.data.meta.hasNextPage} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}

      <Dialog open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader><CategoryForm category={editing} onCancel={() => setEditing(undefined)} onSubmit={(payload) => editing ? updateMutation.mutate({ id: editing.id, payload }) : createMutation.mutate(payload)} /></DialogContent>
      </Dialog>
    </div>
  );
}

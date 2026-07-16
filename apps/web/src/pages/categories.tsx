import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CategoriesPage() {
  const categories = [
    { name: 'Technology', subcategories: 42, books: 328, status: 'Active', growth: '+15%' },
    { name: 'Business', subcategories: 38, books: 294, status: 'Active', growth: '+22%' },
    { name: 'Health & Fitness', subcategories: 31, books: 187, status: 'Active', growth: '+8%' },
    { name: 'Self-Help', subcategories: 28, books: 245, status: 'Active', growth: '+12%' },
    { name: 'Finance', subcategories: 25, books: 156, status: 'Active', growth: '+18%' },
    { name: 'Marketing', subcategories: 22, books: 134, status: 'Active', growth: '+25%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your publishing categories and subcategories</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {category.status}
                  </Badge>
                  <span className="text-emerald-600">{category.growth}</span>
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subcategories</p>
                  <p className="text-2xl font-bold">{category.subcategories}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Books</p>
                  <p className="text-2xl font-bold">{category.books}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { ArrowUpRight, BookOpen, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your publishing overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Generated</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,429</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600">+24%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publishing Queue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-muted-foreground">Active items in pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Credits Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,450</div>
            <p className="text-xs text-muted-foreground">of 10,000 available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Books</CardTitle>
            <CardDescription>Latest AI-generated books from your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'Advanced JavaScript Patterns',
                  category: 'Programming',
                  status: 'Published',
                  date: '2 hours ago',
                },
                {
                  title: 'Machine Learning Fundamentals',
                  category: 'AI & ML',
                  status: 'In Review',
                  date: '5 hours ago',
                },
                {
                  title: 'Digital Marketing Mastery',
                  category: 'Marketing',
                  status: 'Publishing',
                  date: '1 day ago',
                },
                {
                  title: 'Cloud Architecture Guide',
                  category: 'Cloud Computing',
                  status: 'Draft',
                  date: '2 days ago',
                },
              ].map((book, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        book.status === 'Published'
                          ? 'default'
                          : book.status === 'In Review'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {book.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{book.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-between" variant="outline">
              Generate New Book
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              Add Category
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              View Pipeline
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              Market Research
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Intelligence summary for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">Quality Score</p>
              <p className="mt-2 text-3xl font-bold text-primary">94.2%</p>
              <p className="text-xs text-muted-foreground">Above industry average</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">Trending Categories</p>
              <p className="mt-2 text-3xl font-bold text-secondary">12</p>
              <p className="text-xs text-muted-foreground">High potential markets</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">Pipeline Efficiency</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">87%</p>
              <p className="text-xs text-muted-foreground">Optimal performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

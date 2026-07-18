import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, BookOpen, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardQueryKeys, fetchDashboardSummary } from '@/features/dashboard/dashboard-api';
import { launchQuickActions } from '@/app/routes';
import { useDashboardPermissions } from '@/features/analytics-dashboard/hooks/use-dashboard-permissions';
import { hasPermissions } from '@/features/analytics-dashboard/lib/permissions';

export function DashboardPage() {
  const permissions = useDashboardPermissions();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: dashboardQueryKeys.summary, queryFn: fetchDashboardSummary });
  const actions = launchQuickActions.filter((action) => hasPermissions(action.permission ? [action.permission] : undefined, permissions));

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-20" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />)}</div><Skeleton className="h-80" /></div>;
  if (isError) return <Card><CardContent className="py-10 text-center text-destructive">Unable to load dashboard. <Button variant="link" onClick={() => refetch()}>Retry</Button></CardContent></Card>;

  const cards = [
    { title: 'Total Categories', value: data?.kpis.categories.value ?? 0, helper: 'Database-backed taxonomy records', icon: BookOpen },
    { title: 'Book Projects', value: data?.kpis.projects.value ?? 0, helper: `${data?.kpis.projects.active ?? 0} active projects`, icon: Sparkles },
    { title: 'Publishing Queue', value: data?.kpis.publishingQueue.value ?? 0, helper: `${data?.kpis.publishingQueue.running ?? 0} running • ${data?.kpis.publishingQueue.failed ?? 0} failed`, icon: TrendingUp },
    { title: 'AI Insights', value: data?.kpis.aiInsights.value ?? 0, helper: 'Active generated insights', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-muted-foreground">Publishing overview from live APC data.</p></div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => <Card key={card.title}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{card.title}</CardTitle><card.icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{card.value.toLocaleString()}</div><p className="text-xs text-muted-foreground">{card.helper}</p></CardContent></Card>)}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Recent Projects</CardTitle><CardDescription>Latest book projects from the database</CardDescription></CardHeader>
          <CardContent>
            {!data?.recentProjects.length ? <p className="py-8 text-center text-sm text-muted-foreground">No book projects yet.</p> : <div className="space-y-4">{data.recentProjects.map((project) => <div key={project.id} className="flex items-center justify-between gap-4"><div className="min-w-0 space-y-1"><p className="truncate text-sm font-medium leading-none">{project.title}</p><p className="text-sm text-muted-foreground">{project.projectCode} • {project.currentStage}</p></div><div className="flex items-center gap-2"><Badge variant={project.status === 'PUBLISHED' ? 'default' : project.status === 'REVIEWING' ? 'secondary' : 'outline'}>{project.status}</Badge><span className="text-xs text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</span></div></div>)}</div>}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Available actions for your role</CardDescription></CardHeader>
          <CardContent className="space-y-2">{actions.length ? actions.map((action) => <Button key={action.id} asChild className="h-auto w-full justify-between p-4 text-left" variant="outline"><Link to={action.path}><span><span className="block font-medium">{action.label}</span><span className="block text-xs text-muted-foreground">{action.description}</span></span><ArrowUpRight className="h-4 w-4" /></Link></Button>) : <p className="py-8 text-center text-sm text-muted-foreground">No quick actions available.</p>}</CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI-Powered Insights</CardTitle><CardDescription>Latest validated insight records</CardDescription></CardHeader>
        <CardContent className="space-y-3">{!data?.recentInsights.length ? <p className="py-8 text-center text-sm text-muted-foreground">No AI insights available yet.</p> : data.recentInsights.map((insight) => <div key={insight.id} className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium">{insight.title}</p><Badge variant={insight.priority === 'CRITICAL' || insight.priority === 'HIGH' ? 'warning' : 'secondary'}>{insight.priority}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{insight.summary}</p><p className="mt-2 text-xs text-muted-foreground">Confidence {Math.round(insight.confidence)}% • {new Date(insight.generatedAt).toLocaleDateString()}</p></div>)}</CardContent>
      </Card>
    </div>
  );
}

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';

const DashboardPage = lazy(() => import('@/pages/dashboard').then((module) => ({ default: module.DashboardPage })));
const CategoriesPage = lazy(() => import('@/pages/categories').then((module) => ({ default: module.CategoriesPage })));
const SettingsPage = lazy(() => import('@/pages/settings').then((module) => ({ default: module.SettingsPage })));
const AnalyticsDashboardPage = lazy(() => import('@/pages/analytics').then((module) => ({ default: module.AnalyticsDashboardPage })));
const ExecutiveDashboardPage = lazy(() => import('@/features/executive-dashboard').then((module) => ({ default: module.ExecutiveDashboardPage })));
const UserDashboardPage = lazy(() => import('@/features/user-dashboard').then((module) => ({ default: module.UserDashboardPage })));
const SalesDashboardPage = lazy(() => import('@/features/sales-dashboard').then((module) => ({ default: module.SalesDashboardPage })));
const RevenueDashboardPage = lazy(() => import('@/features/revenue-dashboard').then((module) => ({ default: module.RevenueDashboardPage })));
const EntityAnalyticsDashboardPage = lazy(() => import('@/features/entity-analytics-dashboard').then((module) => ({ default: module.EntityAnalyticsDashboardPage })));
const OpportunityDashboardPage = lazy(() => import('@/features/opportunity-ai-dashboards').then((module) => ({ default: module.OpportunityDashboardPage })));
const AIInsightsDashboardPage = lazy(() => import('@/features/opportunity-ai-dashboards').then((module) => ({ default: module.AIInsightsDashboardPage })));
const OperationsDashboardPage = lazy(() => import('@/features/operations-admin-dashboards').then((module) => ({ default: module.OperationsDashboardPage })));
const AdministrationDashboardPage = lazy(() => import('@/features/operations-admin-dashboards').then((module) => ({ default: module.AdministrationDashboardPage })));
const BackgroundJobsPage = lazy(() => import('@/features/background-jobs').then((module) => ({ default: module.BackgroundJobsPage })));
const ResiliencePage = lazy(() => import('@/features/resilience').then((module) => ({ default: module.ResiliencePage })));
const LoginPage = lazy(() => import('@/pages/login').then((module) => ({ default: module.LoginPage })));
const ProjectsPage = lazy(() => import('@/pages/projects').then((module) => ({ default: module.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/projects').then((module) => ({ default: module.ProjectDetailPage })));

function ProtectedRoutes() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading session…</div>;
  if (!auth.isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: location }} />;
  return <Outlet />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
              <Routes>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route element={<ProtectedRoutes />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analytics" element={<Navigate to="/analytics/executive" replace />} />
                <Route path="/analytics/overview" element={<ExecutiveDashboardPage />} />
                <Route path="/analytics/executive" element={<ExecutiveDashboardPage />} />
                <Route path="/analytics/user" element={<UserDashboardPage />} />
                <Route path="/analytics/sales" element={<SalesDashboardPage />} />
                <Route path="/analytics/revenue" element={<RevenueDashboardPage />} />
                <Route path="/analytics/books" element={<EntityAnalyticsDashboardPage dashboardKey="book-analytics-dashboard" />} />
                <Route path="/analytics/editions" element={<EntityAnalyticsDashboardPage dashboardKey="edition-analytics-dashboard" />} />
                <Route path="/analytics/authors" element={<EntityAnalyticsDashboardPage dashboardKey="author-analytics-dashboard" />} />
                <Route path="/analytics/series" element={<EntityAnalyticsDashboardPage dashboardKey="series-analytics-dashboard" />} />
                <Route path="/analytics/providers" element={<EntityAnalyticsDashboardPage dashboardKey="provider-analytics-dashboard" />} />
                <Route path="/analytics/marketplaces" element={<EntityAnalyticsDashboardPage dashboardKey="marketplace-analytics-dashboard" />} />
                <Route path="/analytics/geography" element={<EntityAnalyticsDashboardPage dashboardKey="geographic-analytics-dashboard" />} />
                <Route path="/analytics/formats" element={<EntityAnalyticsDashboardPage dashboardKey="format-analytics-dashboard" />} />
                <Route path="/analytics/opportunities" element={<OpportunityDashboardPage />} />
                <Route path="/analytics/ai-insights" element={<AIInsightsDashboardPage />} />
                <Route path="/analytics/operations" element={<OperationsDashboardPage />} />
                <Route path="/analytics/administration" element={<AdministrationDashboardPage />} />
                <Route path="/operations/jobs" element={<BackgroundJobsPage />} />
                <Route path="/operations/resilience" element={<ResiliencePage />} />
                <Route path="/analytics/:dashboardKey" element={<AnalyticsDashboardPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/books" element={<ProjectsPage />} />
                <Route path="/books/:id" element={<ProjectDetailPage />} />
                <Route path="/generation/:id" element={<ProjectDetailPage initialTab="generation" />} />
                <Route path="/production/:id" element={<ProjectDetailPage initialTab="production" />} />
                <Route path="/publishing/:id" element={<ProjectDetailPage initialTab="publishing" />} />
                <Route path="/export/:id" element={<ProjectDetailPage initialTab="export" />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<div className="rounded-lg border bg-card p-10 text-center"><h1 className="text-2xl font-semibold">Not found</h1><p className="mt-2 text-muted-foreground">This route is not available in the launch workspace.</p></div>} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

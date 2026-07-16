import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Footer } from './footer';
import { Toaster } from '@/components/ui/toaster';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900" id="main-content">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      <Toaster />
    </div>
  );
}

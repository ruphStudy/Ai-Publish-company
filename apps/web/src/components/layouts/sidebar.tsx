import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  FolderTree,
  BookOpen,
  Factory,
  Send,
  BarChart3,
  Settings,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  {
    icon: Brain,
    label: 'Knowledge Intelligence',
    href: '/knowledge',
    children: [
      { label: 'Categories', href: '/categories' },
      { label: 'Research', href: '/research' },
      { label: 'Market Intelligence', href: '/market-intelligence' },
    ],
  },
  { icon: BookOpen, label: 'Books', href: '/books' },
  {
    icon: Factory,
    label: 'Book Production',
    href: '/production',
    children: [
      { label: 'Generator', href: '/generator' },
      { label: 'Pipeline', href: '/pipeline' },
      { label: 'Templates', href: '/templates' },
    ],
  },
  { icon: Send, label: 'Publishing', href: '/publishing' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-r bg-slate-950 text-slate-100 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">AI Publisher</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-auto text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.href}>
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                    location.pathname === item.href && 'bg-slate-800 text-slate-100',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Button>
              </Link>
              {!collapsed && item.children && (
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-800 pl-4">
                  {item.children.map((child) => (
                    <Link key={child.href} to={child.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-slate-500 hover:text-slate-300',
                          location.pathname === child.href && 'text-slate-100'
                        )}
                      >
                        {child.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="bg-slate-800" />

      <div className="p-4">
        {!collapsed ? (
          <div className="rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 p-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium">AI Credits</p>
            </div>
            <p className="mt-1 text-2xl font-bold">8,450</p>
            <p className="mt-0.5 text-xs text-slate-400">of 10,000 remaining</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

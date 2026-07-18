import { Bell, Moon, Sun, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export interface HeaderNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  notifications?: HeaderNotification[];
  user?: { name: string; email?: string; role?: string; avatarUrl?: string; initials?: string };
  onSignOut?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationRead?: (id: string) => void;
  onNotificationOpen?: (id: string) => void;
  onAllNotificationsRead?: () => void;
  className?: string;
}

export function Header({
  notifications = [],
  user = { name: 'User', initials: 'US' },
  onSignOut,
  onProfileClick,
  onSettingsClick,
  onNotificationRead,
  onNotificationOpen,
  onAllNotificationsRead,
  className,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-4" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" aria-hidden />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {unreadCount > 0 && <Badge className="h-5 text-xs">{unreadCount}</Badge>}
              </div>
              {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={onAllNotificationsRead}>Mark all read</Button>}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onNotificationRead?.(n.id);
                      onNotificationOpen?.(n.id);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-muted',
                      !n.read && 'bg-primary/5',
                    )}
                  >
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm', !n.read && 'font-medium')}>{n.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2" aria-label="User menu">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl ?? ''} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {user.initials ?? user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                {user.role && <span className="mt-0.5 text-xs text-muted-foreground">{user.role}</span>}
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user.name}</p>
              {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onProfileClick && (
              <DropdownMenuItem onClick={onProfileClick} className="gap-2">
                <User className="h-4 w-4" />Profile
              </DropdownMenuItem>
            )}
            {onSettingsClick && (
              <DropdownMenuItem onClick={onSettingsClick} className="gap-2">
                <Settings className="h-4 w-4" />Settings
              </DropdownMenuItem>
            )}
            {onSignOut && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />Sign Out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

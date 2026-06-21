import { ChevronFirst } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';

export function SidebarToggle() {
  const { settings, storeOption } = useSettings();
  const collapsed = settings.layouts.demo1.sidebarCollapse;

  const handleToggle = () => {
    storeOption('layouts.demo1.sidebarCollapse', !collapsed);
  };

  return (
    <Button
      onClick={handleToggle}
      size="sm"
      mode="icon"
      variant="outline"
      aria-label={collapsed ? 'Sidebar\'ı aç' : 'Sidebar\'ı kapat'}
      aria-expanded={!collapsed}
      className={cn(
        'sidebar-collapse-btn hidden lg:inline-flex size-7 fixed z-30',
        'top-[calc(var(--header-height)/2)] -translate-y-1/2',
        'transition-[inset-inline-start] duration-300 ease-in-out',
        collapsed
          ? 'start-3'
          : 'start-[calc(var(--sidebar-width)-0.875rem)]',
        collapsed && 'ltr:rotate-180 rtl:rotate-180',
      )}
    >
      <ChevronFirst className="size-4!" />
    </Button>
  );
}

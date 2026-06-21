import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
  const { settings } = useSettings();
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        'sidebar relative lg:fixed lg:top-0 lg:bottom-0 lg:z-20 lg:flex flex-col items-stretch shrink-0',
        (settings.layouts.demo1.sidebarTheme === 'dark' ||
          pathname.includes('dark-sidebar')) &&
          'dark',
      )}
    >
      <SidebarHeader />
      <div className="overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="w-(--sidebar-default-width) flex flex-col flex-1 min-h-0">
          <SidebarMenu />
          <div className="sidebar-footer hidden lg:block px-5 py-4 mt-auto shrink-0">
            <p className="sidebar-footer-text">Islamic Windows · Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AdminLogo } from '@/components/brand/AdminLogo';

export function SidebarHeader() {
  return (
    <div className="sidebar-header hidden lg:flex items-center relative px-4 shrink-0">
      <AdminLogo to="/" className="sidebar-brand flex-1 min-w-0 overflow-hidden" />
    </div>
  );
}

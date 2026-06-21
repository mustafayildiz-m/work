import { FormattedMessage } from "react-intl";
'use client';

import { useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { Badge } from '@/components/ui/badge';

const statusColor = {
  done: "",
  pending: ""
};

const renderMenuIcon = (Icon, className = '', size = 'default') => {
  if (!Icon) return null;
  return (
    <span
      className={cn(
        'sidebar-menu-icon shrink-0',
        size === 'sm' && 'sidebar-menu-icon-sm',
        size === 'xs' && 'sidebar-menu-icon-xs',
      )}
    >
      <Icon data-slot="accordion-menu-icon" className={className} />
    </span>
  );
};

const renderNavBadge = (count) => (
  <Badge
    variant="danger"
    size="sm"
    className="sidebar-nav-badge ms-auto rounded-full px-1.5 h-5 min-w-5 flex items-center justify-center border-none text-[10px]"
  >
    {count}
  </Badge>
);

const getMenuKey = (text) => {
  let slug = text.trim().replace(/[\s\n\r]+/g, '_').toUpperCase();
  const trMap = {
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U',
    'ç': 'C', 'ğ': 'G', 'ı': 'I', 'ö': 'O', 'ş': 'S', 'ü': 'U'
  };
  slug = slug.replace(/[ÇĞİÖŞÜçğıöşü]/g, match => trMap[match]);
  slug = slug.replace(/[^A-Z0-9_]/g, '');
  return slug.slice(0, 40);
};

export function SidebarMenu() {
  const { pathname } = useLocation();
  const [pendingPostsCount, setPendingPostsCount] = useState(0);

  useEffect(() => {
    const fetchPendingPostsCount = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/user-posts/admin/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingPostsCount(data.length);
        }
      } catch (error) {
        console.error('Error fetching pending posts count:', error);
      }
    };

    fetchPendingPostsCount();

    // Listen for custom event from PostOnaylama page
    window.addEventListener('pendingPostsUpdated', fetchPendingPostsCount);

    // Poll every 1 minute to keep it fresh
    const interval = setInterval(fetchPendingPostsCount, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('pendingPostsUpdated', fetchPendingPostsCount);
    };
  }, []);

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path) =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  // Global classNames — visual styling in admin-premium.css
  const classNames = {
    root: 'sidebar-nav-root space-y-1 px-1',
    group: 'sidebar-nav-group gap-0.5',
    label: 'sidebar-nav-label',
    separator: 'sidebar-nav-separator h-px bg-white/[0.06] my-2',
    item: 'sidebar-nav-link h-11 px-3',
    sub: 'sidebar-nav-sub mt-0.5',
    subTrigger: 'sidebar-nav-link sidebar-nav-parent h-11 px-3',
    subContent: 'sidebar-nav-subcontent',
    indicator: 'sidebar-nav-indicator',
  };

  const buildMenu = (items) => {
    return items.map((item, index) => {
      // Inject dynamic badges recursively
      const injectBadge = (menuItem) => {
        const enhanced = { ...menuItem };

        // Special case for 'Onay Bekleyen Postlar'
        if (
          (menuItem.path === '/kullanicilar/post-onaylama' || menuItem.title === 'Onay Bekleyen Postlar') &&
          pendingPostsCount > 0
        ) {
          enhanced.badge = pendingPostsCount;
        }

        if (menuItem.children) {
          enhanced.children = menuItem.children.map(child => injectBadge(child));
          // If any child has a badge, show it on the parent too (optional, but requested)
          const childWithBadge = enhanced.children.find(c => c.badge !== undefined);
          if (childWithBadge && enhanced.badge === undefined) {
            enhanced.badge = childWithBadge.badge;
          }
        }
        return enhanced;
      };

      const enhancedItem = injectBadge(item);

      if (enhancedItem.heading) {
        return buildMenuHeading(enhancedItem, index);
      } else if (enhancedItem.disabled) {
        return buildMenuItemRootDisabled(enhancedItem, index);
      } else {
        return buildMenuItemRoot(enhancedItem, index);
      }
    });
  };

  const buildMenuItemRoot = (item, index) => {
    const colorClass = statusColor[item.status] || "";
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className={`${colorClass} flex items-center justify-between gap-2 w-full`}>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              {renderMenuIcon(item.icon, colorClass)}
              <span data-slot="accordion-menu-title"><FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} /></span>
            </div>
            {item.badge !== undefined && renderNavBadge(item.badge)}
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(item.children, 1)}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className={`text-sm font-medium ${colorClass}`}
          asChild
        >
          <Link
            to={item.path || '#'}
            className="flex items-center justify-between gap-2 w-full h-11"
          >
            <div className="flex flex-1 items-center gap-3 min-w-0">
              {renderMenuIcon(item.icon, colorClass)}
              <span data-slot="accordion-menu-title"><FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} /></span>
            </div>
            {item.badge !== undefined && renderNavBadge(item.badge)}
          </Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemRootDisabled = (item, index) => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-${index}`}
        className="text-sm font-medium"
      >
        {item.icon && renderMenuIcon(item.icon)}
        <span data-slot="accordion-menu-title"><FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} /></span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto me-[-10px]">
            <FormattedMessage id="UI.SOON" />
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuItemChildren = (items, level = 0) => {
    return items.map((item, index) => {
      if (item.disabled) {
        return buildMenuItemChildDisabled(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };

  const buildMenuItemChild = (item, index, level = 0) => {
    const colorClass = statusColor[item.status] || "";
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className={`${colorClass} flex items-center justify-between gap-2 w-full min-h-10`}>
            <div className="flex flex-1 items-center gap-2.5 min-w-0">
              {renderMenuIcon(item.icon, colorClass, 'sm')}
              {item.collapse ? (
                <span className="text-muted-foreground">
                  <span className="hidden [[data-state=open]>span>&]:inline">
                    {item.collapseTitle}
                  </span>
                  <span className="inline [[data-state=open]>span>&]:hidden">
                    {item.expandTitle}
                  </span>
                </span>
              ) : (
                <span data-slot="accordion-menu-title">
                  <FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} />
                </span>
              )}
            </div>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `child-${level}-${index}`}
            className={cn(
              'ps-4',
              !item.collapse && 'relative',
              !item.collapse && (level > 0 ? '' : ''),
            )}
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(
                item.children,
                item.collapse ? level : level + 1,
              )}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className={`text-[13px] ${colorClass}`}
          asChild
        >
          <Link
            to={item.path || '#'}
            className="sidebar-nav-child-link flex items-center justify-between gap-2 w-full min-h-9 px-2"
          >
            <div className="flex flex-1 items-center gap-2.5 min-w-0">
              {renderMenuIcon(item.icon, colorClass, 'xs')}
              <span className="flex-1" data-slot="accordion-menu-title">
                <FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} />
              </span>
            </div>
            {item.badge !== undefined && renderNavBadge(item.badge)}
          </Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemChildDisabled = (item, index, level = 0) => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-child-${level}-${index}`}
        className="text-[13px]"
      >
        {renderMenuIcon(item.icon, '', 'xs')}
        <span data-slot="accordion-menu-title"><FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} /></span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto me-[-10px]">
            <FormattedMessage id="UI.SOON" />
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuHeading = (item, index) => {
    return <AccordionMenuLabel key={index}><FormattedMessage id={`MENU.${getMenuKey(item.heading)}`} defaultMessage={item.heading} /></AccordionMenuLabel>;
  };

  return (
    <div className="sidebar-nav-scroll kt-scrollable-y-hover flex-1 min-h-0 overflow-y-auto py-4 px-3">
      <AccordionMenu
        selectedValue={pathname}
        matchPath={matchPath}
        type="single"
        collapsible
        classNames={classNames}
      >
        {buildMenu(MENU_SIDEBAR)}
      </AccordionMenu>
    </div>
  );
}

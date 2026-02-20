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
  done: "text-accent-foreground",
  pending: "text-accent-foreground"
};

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

  // Global classNames for consistent styling
  const classNames = {
    root: 'lg:ps-1 space-y-3',
    group: 'gap-px',
    label:
      'uppercase text-xs font-medium text-muted-foreground/70 pt-2.25 pb-px',
    separator: '',
    item: 'h-8 px-2.5 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'h-8 px-2.5 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
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
    const colorClass = statusColor[item.status] || "text-accent-foreground";
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className={`text-sm font-medium ${colorClass} flex items-center justify-between grow gap-2 w-full`}>
            <div className="flex items-center gap-2">
              {item.icon && <item.icon data-slot="accordion-menu-icon" className={colorClass} />}
              <span data-slot="accordion-menu-title"><FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} /></span>
            </div>
            {item.badge !== undefined && (
              <Badge variant="danger" size="sm" className="ms-auto rounded-full px-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white border-none text-[10px]">
                {item.badge}
              </Badge>
            )}
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
        >
          <Link
            to={item.path || '#'}
            className="flex items-center justify-between grow gap-2 w-full"
          >
            <div className="flex items-center gap-2">
              {item.icon && <item.icon data-slot="accordion-menu-icon" className={colorClass} />}
              <span data-slot="accordion-menu-title"><FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} /></span>
            </div>
            {item.badge !== undefined && (
              <Badge variant="danger" size="sm" className="ms-auto rounded-full px-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white border-none">
                {item.badge}
              </Badge>
            )}
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
        {item.icon && <item.icon data-slot="accordion-menu-icon" />}
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
    const colorClass = statusColor[item.status] || "text-accent-foreground";
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className={`text-[13px] ${colorClass}`}>
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
              <FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} />
            )}
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
        >
          <Link
            to={item.path || '#'}
            className="flex items-center justify-between grow gap-2 w-full"
          >
            <span><FormattedMessage id={`MENU.${getMenuKey(item.title)}`} defaultMessage={item.title} /></span>
            {item.badge !== undefined && (
              <Badge variant="danger" size="sm" className="ms-auto rounded-full px-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white border-none text-[10px]">
                {item.badge}
              </Badge>
            )}
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
    <div className="kt-scrollable-y-hover flex grow shrink-0 py-5 px-5 lg:max-h-[calc(100vh-5.5rem)]">
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

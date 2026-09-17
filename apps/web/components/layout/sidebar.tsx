'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { LogoutButton } from '@/app/(dashboard)/logout-button';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  disabled: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  displayName: string;
  email: string;
}

export function Sidebar({ navItems, displayName, email }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Optional: load initial state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chesswise-sidebar-collapsed');
    if (saved) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem('chesswise-sidebar-collapsed', JSON.stringify(nextState));
  };

  return (
    <aside
      className={`hidden flex-col border-r border-border bg-card transition-all duration-300 md:flex ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div
        className={`flex items-center border-b border-border py-4 ${collapsed ? 'justify-center px-2' : 'justify-between pl-6 pr-4'}`}
      >
        {!collapsed && (
          <span className="font-serif text-lg font-bold text-foreground">Chesswise</span>
        )}
        <button
          onClick={toggleCollapse}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center rounded-md py-2 transition-colors ${
                collapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                item.disabled
                  ? 'cursor-not-allowed text-muted-foreground/50'
                  : isActive
                    ? 'bg-accent/80 font-medium text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              aria-disabled={item.disabled}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.disabled && (
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={`border-t border-border p-4 ${collapsed ? 'flex flex-col items-center' : ''}`}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          )}
        </div>
        <div className="w-full">
          <LogoutButton collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}

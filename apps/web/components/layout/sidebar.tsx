'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Swords,
  Target,
  BookOpen,
  BarChart3,
  UploadCloud,
  Sparkles,
  User,
  GraduationCap,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';
import { useSidebar } from './sidebar-context';
import { logout } from '@/app/(auth)/actions';

export interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItemConfig[];
}

export interface SidebarProps {
  displayName: string;
  email: string;
  isPro?: boolean;
  level?: number;
  role?: string;
  // Backward compatibility in case passed
  navItems?: unknown[];
}

export function Sidebar({ displayName, email, isPro = false, level = 1, role }: SidebarProps) {
  const { collapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();
  const pathname = usePathname();
  const isCoach = role === 'COACH';

  const navGroups: NavGroup[] = [
    {
      title: 'Train & Play',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/play', label: 'Play AI', icon: Bot },
        { href: '/multiplayer', label: 'Play PvP', icon: Swords },
        { href: '/train', label: 'Daily Gym', icon: Target },
        { href: '/openings', label: 'Openings', icon: BookOpen },
      ],
    },
    {
      title: 'Analyze & Study',
      items: [
        { href: '/analyze', label: 'Analyze', icon: BarChart3 },
        { href: '/import', label: 'Import PGN', icon: UploadCloud },
        { href: '/coach', label: 'AI Coach', icon: Sparkles },
        { href: '/profile', label: 'Skill Profile', icon: User },
        ...(isCoach ? [{ href: '/students', label: 'Students', icon: GraduationCap }] : []),
      ],
    },
    {
      title: 'Account',
      items: [
        { href: '/settings', label: 'Settings', icon: Settings },
        {
          href: '/pricing',
          label: isPro ? 'Pro Status' : 'Upgrade to Pro',
          icon: Crown,
          badge: isPro ? 'PRO' : 'NEW',
        },
      ],
    },
  ];

  const renderNavContent = (isMobile = false) => {
    return (
      <div className="flex h-full flex-col">
        {/* Brand Header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-border/60 ${
            !isMobile && collapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          <Link
            href="/dashboard"
            onClick={isMobile ? closeMobile : undefined}
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            {/* Golden Knight / Chesswise Logo Emblem */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent shadow-sm shadow-amber-950/30 transition-transform group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-primary transition-transform group-hover:rotate-3"
              >
                <path d="M19 22H5a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1ZM17 16H7a1 1 0 0 1-.96-.73l-1.5-5.5a1 1 0 0 1 .42-1.12l3.04-2.02V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2.63l3.04 2.02a1 1 0 0 1 .42 1.12l-1.5 5.5A1 1 0 0 1 17 16Zm-7.5-6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
              </svg>
            </div>

            {(isMobile || !collapsed) && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                    Chesswise
                  </span>
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                    AI
                  </span>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Adaptive Trainer
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Trigger */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className={`rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
                collapsed ? 'hidden' : 'block'
              }`}
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Close Trigger */}
          {isMobile && (
            <button
              onClick={closeMobile}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Close Navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Collapsed expand toggle button */}
        {!isMobile && collapsed && (
          <div className="flex justify-center border-b border-border/40 py-2">
            <button
              onClick={toggleCollapse}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Expand Sidebar"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {(isMobile || !collapsed) && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isMobile ? closeMobile : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    title={!isMobile && collapsed ? item.label : undefined}
                    className={`group relative flex items-center rounded-lg text-sm transition-all duration-150 ${
                      !isMobile && collapsed
                        ? 'mx-auto h-10 w-10 justify-center'
                        : 'gap-3 px-3 py-2'
                    } ${
                      isActive
                        ? 'border-l-2 border-primary bg-primary/10 font-semibold text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    {(isMobile || !collapsed) && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {(isMobile || !collapsed) && item.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.badge === 'PRO'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card Footer */}
        <div className="shrink-0 border-t border-border/60 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-2 ${
              !isMobile && collapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            {/* User Avatar with Gold Border */}
            <Link
              href="/profile"
              onClick={isMobile ? closeMobile : undefined}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-serif text-sm font-bold text-primary transition-colors hover:border-primary"
              title={displayName}
            >
              {(displayName || 'Player').charAt(0).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </Link>

            {(isMobile || !collapsed) && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
                  {isPro ? (
                    <span className="rounded bg-primary/20 px-1 py-0.5 text-[9px] font-bold text-primary">
                      PRO
                    </span>
                  ) : (
                    <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
                      Lv {level}
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{email}</p>
              </div>
            )}

            {(isMobile || !collapsed) && (
              <button
                onClick={() => logout()}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                aria-label="Sign Out"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {!isMobile && collapsed && (
            <button
              onClick={() => logout()}
              className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              aria-label="Sign Out"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden flex-col border-r border-border/60 bg-card transition-all duration-300 md:flex ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Slide-out drawer */}
          <div className="relative flex w-72 max-w-[85vw] flex-col border-r border-border/60 bg-card shadow-2xl">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}

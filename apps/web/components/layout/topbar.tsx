'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Flame,
  Zap,
  Crown,
  Plus,
  BarChart3,
  Bot,
  Target,
  BookOpen,
  Sparkles,
  UploadCloud,
  User,
  Settings,
  GraduationCap,
  Swords,
  LayoutDashboard,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useSidebar } from './sidebar-context';

interface TopbarProps {
  displayName: string;
  email: string;
  xp?: number;
  level?: number;
  isPro?: boolean;
  streakDays?: number;
}

const ROUTE_CONFIG: Record<
  string,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Training Overview & Readiness',
    icon: LayoutDashboard,
  },
  '/play': {
    title: 'Play AI',
    subtitle: 'Human-like bots with Socratic feedback',
    icon: Bot,
  },
  '/multiplayer': {
    title: 'Multiplayer Arena',
    subtitle: 'Play live games with peers',
    icon: Swords,
  },
  '/analyze': {
    title: 'Game Analysis',
    subtitle: 'Deep cloud Stockfish & tactic detection',
    icon: BarChart3,
  },
  '/import': {
    title: 'Import Games',
    subtitle: 'Upload PGNs or sync from Lichess / Chess.com',
    icon: UploadCloud,
  },
  '/train': {
    title: 'Daily Gym',
    subtitle: 'Spaced repetition flashcards from your mistakes',
    icon: Target,
  },
  '/openings': {
    title: 'Opening Repertoire',
    subtitle: 'Build, drill, and guard your repertoire',
    icon: BookOpen,
  },
  '/coach': {
    title: 'AI Coach Chat',
    subtitle: 'Grounded Socratic explanations for your games',
    icon: Sparkles,
  },
  '/profile': {
    title: 'Skill Profile',
    subtitle: 'Tactical and strategic radar telemetry',
    icon: User,
  },
  '/students': {
    title: 'Student Roster',
    subtitle: 'Coach oversight and aggregate weak points',
    icon: GraduationCap,
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Account, sound, engine & platform preferences',
    icon: Settings,
  },
  '/pricing': {
    title: 'Pro Membership',
    subtitle: 'Unlock unlimited cloud engine & voice recaps',
    icon: CreditCard,
  },
};

export function Topbar({
  displayName,
  xp = 0,
  level = 1,
  isPro = false,
  streakDays = 3,
}: TopbarProps) {
  const { toggleMobile } = useSidebar();
  const pathname = usePathname() || '/dashboard';

  // Find matching route or fallback
  let currentMeta = ROUTE_CONFIG[pathname];
  if (!currentMeta) {
    if (pathname.startsWith('/report/')) {
      currentMeta = {
        title: 'Deep Game Report',
        subtitle: 'Move-by-move quality breakdown and audio recap',
        icon: FileText,
      };
    } else if (pathname.startsWith('/openings/drill/')) {
      currentMeta = {
        title: 'Repertoire Drill',
        subtitle: 'Deviation Guardian active trainer',
        icon: BookOpen,
      };
    } else {
      currentMeta = {
        title: 'Chesswise Studio',
        subtitle: 'AI Grandmaster Assistant',
        icon: Sparkles,
      };
    }
  }

  const IconComponent = currentMeta.icon;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md transition-all sm:px-6">
      {/* Left: Mobile Toggle + Breadcrumb / Route Meta */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary sm:flex">
            <IconComponent className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {currentMeta.title}
              </h1>
              <span className="hidden items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground lg:inline-flex">
                v1.0 Studio
              </span>
            </div>
            <p className="hidden text-xs text-muted-foreground md:block">{currentMeta.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Right: Gamification Pills + Quick Action + Plan Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Pill */}
        <div
          className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 shadow-sm"
          title={`${streakDays} days active training streak`}
        >
          <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="tabular-nums">{streakDays}d</span>
          <span className="hidden text-[10px] uppercase tracking-wider text-amber-400/80 sm:inline">
            streak
          </span>
        </div>

        {/* Level & XP Chip */}
        <div
          className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-2.5 py-1 text-xs font-medium text-foreground/90 sm:flex"
          title={`Level ${level} • ${xp.toLocaleString()} XP earned`}
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-primary">Lv {level}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="tabular-nums text-muted-foreground">{xp.toLocaleString()} XP</span>
        </div>

        {/* Pro Status or Upgrade CTA */}
        {isPro ? (
          <div className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-gradient-to-r from-amber-500/15 to-amber-600/10 px-2.5 py-1 text-xs font-bold tracking-wide text-primary shadow-sm shadow-amber-950/20">
            <Crown className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>PRO</span>
          </div>
        ) : (
          <Link
            href="/pricing"
            className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all duration-150 hover:border-primary/60 hover:bg-primary/20 hover:shadow-[0_0_12px_rgba(201,162,75,0.25)] sm:flex"
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Upgrade</span>
          </Link>
        )}

        {/* Quick Play CTA Button */}
        <Link
          href="/play"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 hover:shadow-[0_0_16px_rgba(201,162,75,0.35)] active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="xs:inline hidden">New Game</span>
          <span className="xs:hidden">Play</span>
        </Link>

        {/* User Mini Avatar */}
        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-card font-serif text-xs font-bold text-primary transition-colors hover:border-primary"
          title={displayName}
          aria-label="View user profile"
        >
          {(displayName || 'Player').charAt(0).toUpperCase()}
        </Link>
      </div>
    </header>
  );
}

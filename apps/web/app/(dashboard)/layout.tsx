import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { SidebarProvider } from '@/components/layout/sidebar-context';
import { LayoutDashboard, Bot, Target, BarChart3, User } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.upsert({
      where: { supabaseId: user.id },
      update: {},
      create: {
        supabaseId: user.id,
        email: user.email ?? 'unknown@example.com',
        displayName:
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Player',
      },
      select: {
        role: true,
        xp: true,
        level: true,
        isPro: true,
        displayName: true,
      },
    });
  } catch (error) {
    console.warn('[DashboardLayout] Prisma user resolution warning:', error);
    try {
      dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: {
          role: true,
          xp: true,
          level: true,
          isPro: true,
          displayName: true,
        },
      });
    } catch {
      dbUser = null;
    }
  }

  const displayName =
    dbUser?.displayName ||
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Player';
  const email = user.email || '';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Modern SaaS Desktop Sidebar */}
        <Sidebar
          displayName={displayName}
          email={email}
          isPro={dbUser?.isPro ?? false}
          level={dbUser?.level ?? 1}
          role={dbUser?.role ?? 'PLAYER'}
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Unified Sticky Topbar */}
          <Topbar
            displayName={displayName}
            email={email}
            xp={dbUser?.xp ?? 0}
            level={dbUser?.level ?? 1}
            isPro={dbUser?.isPro ?? false}
          />

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>
        </div>

        {/* Mobile bottom tab bar (modern Lucide icons, glassmorphism) */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border/60 bg-card/95 py-2.5 shadow-lg backdrop-blur-md md:hidden"
        >
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">Home</span>
          </Link>
          <Link
            href="/play"
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            <Bot className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">Play</span>
          </Link>
          <Link
            href="/train"
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            <Target className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">Gym</span>
          </Link>
          <Link
            href="/analyze"
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">Analyze</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight">Profile</span>
          </Link>
        </nav>
      </div>
    </SidebarProvider>
  );
}

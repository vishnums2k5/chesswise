import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠', disabled: false },
  { href: '/play', label: 'Play AI', icon: '🤖', disabled: false },
  { href: '/multiplayer', label: 'Play PvP', icon: '⚔️', disabled: false },
  { href: '/analyze', label: 'Analyze', icon: '📊', disabled: false },
  { href: '/import', label: 'Import', icon: '📥', disabled: false },
  { href: '/profile', label: 'Profile', icon: '📈', disabled: false },
  { href: '/train', label: 'Train', icon: '🎯', disabled: false },
  { href: '/openings', label: 'Openings', icon: '📖', disabled: false },
  { href: '/coach', label: 'Coach', icon: '💬', disabled: false },
  { href: '/settings', label: 'Settings', icon: '⚙️', disabled: false },
  { href: '/pricing', label: 'Pro', icon: '⭐', disabled: false },
];

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
    dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { role: true },
    });
  } catch (error) {
    console.error('Failed to fetch user from Prisma:', error);
  }

  const isCoach = dbUser?.role === 'COACH';
  const finalNavItems = isCoach
    ? [...navItems, { href: '/students', label: 'Students', icon: '👨‍🎓', disabled: false }]
    : navItems;

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player';
  const email = user.email || '';

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar Component */}
      <Sidebar navItems={finalNavItems} displayName={displayName} email={email} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <span className="font-serif text-lg font-bold text-foreground">Chesswise</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-border bg-card py-2 md:hidden">
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-muted-foreground"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

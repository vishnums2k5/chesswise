'use client';

import { logout } from '../(auth)/actions';
import { LogOut } from 'lucide-react';

export function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  return (
    <button
      onClick={() => logout()}
      className={`mt-3 flex w-full items-center justify-center rounded-md border border-border py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
        collapsed ? 'px-0' : 'px-3'
      }`}
      title={collapsed ? 'Sign Out' : undefined}
    >
      {collapsed ? <LogOut size={16} /> : 'Sign Out'}
    </button>
  );
}

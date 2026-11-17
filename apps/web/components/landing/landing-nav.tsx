'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Crown, Sparkles, Menu, X, ArrowRight } from 'lucide-react';

interface LandingNavProps {
  userEmail?: string | null;
}

export function LandingNav({ userEmail }: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Socratic AI', href: '#socratic-coach' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Comparison', href: '#comparison' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Crown className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              Chesswise
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              AI Coach
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {userEmail ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-amber-500 px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition-all hover:shadow-primary/25 hover:brightness-105 active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Start Training Free</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 px-5 py-4 backdrop-blur-md animate-in slide-in-from-top-2 md:hidden">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {userEmail ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center justify-center rounded-xl border border-border py-2 text-xs font-medium text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Start Training Free</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

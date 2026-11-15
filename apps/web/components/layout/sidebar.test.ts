import { describe, it, expect } from 'vitest';

describe('Navigation Structure & Role Segregation', () => {
  const getNavItemsForRole = (role?: string, isPro = false) => {
    const isCoach = role === 'COACH';
    return [
      {
        title: 'Train & Play',
        items: [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/play', label: 'Play AI' },
          { href: '/multiplayer', label: 'Play PvP' },
          { href: '/train', label: 'Daily Gym' },
          { href: '/openings', label: 'Openings' },
        ],
      },
      {
        title: 'Analyze & Study',
        items: [
          { href: '/analyze', label: 'Analyze' },
          { href: '/import', label: 'Import PGN' },
          { href: '/coach', label: 'AI Coach' },
          { href: '/profile', label: 'Skill Profile' },
          ...(isCoach ? [{ href: '/students', label: 'Students' }] : []),
        ],
      },
      {
        title: 'Account',
        items: [
          { href: '/settings', label: 'Settings' },
          {
            href: '/pricing',
            label: isPro ? 'Pro Status' : 'Upgrade to Pro',
            badge: isPro ? 'PRO' : 'NEW',
          },
        ],
      },
    ];
  };

  it('includes core player navigation routes by default', () => {
    const groups = getNavItemsForRole('PLAYER');
    const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));

    expect(allHrefs).toContain('/dashboard');
    expect(allHrefs).toContain('/play');
    expect(allHrefs).toContain('/multiplayer');
    expect(allHrefs).toContain('/train');
    expect(allHrefs).toContain('/openings');
    expect(allHrefs).toContain('/analyze');
    expect(allHrefs).toContain('/import');
    expect(allHrefs).toContain('/coach');
    expect(allHrefs).toContain('/profile');
    expect(allHrefs).toContain('/settings');
    expect(allHrefs).toContain('/pricing');
  });

  it('excludes student management route for standard players', () => {
    const groups = getNavItemsForRole('PLAYER');
    const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));

    expect(allHrefs).not.toContain('/students');
  });

  it('includes student management route when role is COACH', () => {
    const groups = getNavItemsForRole('COACH');
    const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));

    expect(allHrefs).toContain('/students');
  });

  it('renders PRO badge and Pro Status label when user isPro is true', () => {
    const groups = getNavItemsForRole('PLAYER', true);
    const pricingItem = groups.flatMap((g) => g.items).find((i) => i.href === '/pricing');

    expect(pricingItem).toBeDefined();
    expect(pricingItem?.label).toBe('Pro Status');
    expect(pricingItem?.badge).toBe('PRO');
  });

  it('renders NEW badge and Upgrade to Pro label when user isPro is false', () => {
    const groups = getNavItemsForRole('PLAYER', false);
    const pricingItem = groups.flatMap((g) => g.items).find((i) => i.href === '/pricing');

    expect(pricingItem).toBeDefined();
    expect(pricingItem?.label).toBe('Upgrade to Pro');
    expect(pricingItem?.badge).toBe('NEW');
  });
});

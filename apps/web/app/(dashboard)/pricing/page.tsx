'use client';

import { useState, useEffect } from 'react';
import { Crown, Check, Zap, Sparkles, Bot, BarChart3, Swords, ShieldCheck } from 'lucide-react';

export default function PricingPage() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch('/api/checkout')
      .then((r) => r.json())
      .then((d) => setIsPro(d.isPro))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    // Simulate Dodo Payments checkout flow
    setTimeout(async () => {
      const res = await fetch('/api/checkout', { method: 'POST' });
      if (res.ok) setIsPro(true);
      setUpgrading(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading subscription tiers…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-12">
      {/* Header */}
      <div className="space-y-3 pt-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          <Crown className="h-3.5 w-3.5" />
          <span>Membership Tiers</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Upgrade to Chesswise Pro
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
          Accelerate your tactical growth with unlimited Socratic AI coaching, deep cloud Stockfish
          18 evaluations, and your custom Mirror Bot nemesis.
        </p>
      </div>

      {/* Pricing Comparison Cards */}
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Basic Tier */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-8 shadow-sm backdrop-blur-sm transition-all hover:border-border">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">Free Tier</h3>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                Starter
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-extrabold text-foreground">$0</span>
              <span className="text-xs text-muted-foreground">/ month forever</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Essential training features to analyze your game and practice tactics.
            </p>

            <div className="mt-8 space-y-3.5 border-t border-border/50 pt-6">
              {[
                'Play vs AI opponents (Beginner to Club levels)',
                '3 Socratic AI Coach queries per day',
                'Standard Stockfish 18 evaluation depth',
                'Spaced repetition flashcards (SM-2)',
                'Earn XP and track level progression',
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-xs text-foreground/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              disabled
              className="w-full cursor-default rounded-xl border border-border/70 bg-muted/40 py-3 text-xs font-semibold text-muted-foreground"
            >
              Current Active Plan
            </button>
          </div>
        </div>

        {/* Pro Tier (Featured Bento Card) */}
        <div className="relative flex flex-col justify-between rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-primary/10 via-card/90 to-card p-8 shadow-xl backdrop-blur-md">
          {/* Recommended Pill */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-primary/40 bg-primary px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-md">
            Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-xl font-bold text-primary">Pro Master</h3>
              </div>
              <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Unthrottled
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-black text-foreground">$9</span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Grandmaster-grade AI telemetry, personalized nemesis bots, and priority processing.
            </p>

            <div className="mt-8 space-y-3.5 border-t border-primary/20 pt-6">
              {[
                { title: 'Unlimited Socratic AI Coach dialogues', icon: Sparkles },
                { title: 'Deep Cloud Stockfish 18 Analysis (Depth 20+)', icon: BarChart3 },
                { title: 'Adaptive Mirror Bot (Targeting your specific blunders)', icon: Bot },
                { title: 'Audio Voice Recaps on all analyzed matches', icon: Zap },
                { title: 'Priority Multiplayer Matchmaking & Live Arena', icon: Swords },
                { title: 'Coach Student Oversight Roster (up to 25 students)', icon: ShieldCheck },
              ].map((feat) => (
                <div key={feat.title} className="flex items-start gap-2.5 text-xs text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="font-medium">{feat.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            {isPro ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/20 py-3 text-xs font-bold text-primary shadow-sm">
                <Crown className="h-4 w-4" />
                <span>You are a Pro Member</span>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(201,162,75,0.4)] active:scale-[0.98] disabled:opacity-50"
              >
                <Crown className="h-4 w-4" />
                <span>
                  {upgrading ? 'Processing via Dodo Payments…' : 'Upgrade to Pro ($9/mo)'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
}

const faqs: FAQItem[] = [
  {
    id: 'socratic-vs-engine',
    question: 'How is the Socratic Whisper Coach different from standard Stockfish analysis?',
    answer:
      'Standard chess platforms show a cold eval bar and an intimidating string of computer moves (e.g., "-3.4: 18... cxd4 19. Ne4"). This causes "engine dependency"—you memorize the solution without understanding the why. Chesswise uses a proprietary 3-stage hint ladder (Strategic Theme → Tactical Focus → Concrete Solution). It asks probing questions so your brain builds genuine pattern recognition, just like a master coach sitting beside you.',
    badge: 'Core Feature',
  },
  {
    id: 'lichess-chesscom-sync',
    question: 'How do I import my games from Chess.com and Lichess?',
    answer:
      'Simply type your Chess.com or Lichess username into the PGN Importer or Account Settings. Chesswise fetches your most recent blitz, rapid, or classical games via official public APIs. You can also paste raw PGN notation or upload multi-game .pgn files with one click.',
  },
  {
    id: 'byok-privacy',
    question: 'What is BYOK (Bring-Your-Own-Key) and is my API key stored securely?',
    answer:
      'BYOK allows you to connect your personal Google AI Studio (Gemini), OpenAI, or OpenRouter API key. This gives you unlimited AI reasoning at direct wholesale provider cost (often fractions of a cent per session). Your key is stored locally in your browser’s encrypted localStorage and dual-synced to your private account record. It is never logged or shared.',
    badge: 'Privacy & Control',
  },
  {
    id: 'sm2-spaced-repetition',
    question: 'How does the SM-2 Spaced Repetition engine work for my blunders?',
    answer:
      'Whenever our analysis detects a blunder or missed tactical win in your games, Chesswise automatically generates a personalized puzzle. Rather than solving it once and forgetting it, the SM-2 algorithm schedules reviews at scientific intervals (10 minutes, 1 day, 4 days, 14 days) until the defensive or attacking motif becomes second nature.',
  },
  {
    id: '3d-vs-2d-board',
    question: 'Can I switch between 2D tournament boards and 3D studio views?',
    answer:
      'Yes! You can toggle between ultra-clean tournament 2D vector boards and our WebGL Three.js 3D studio with a single hotkey (Space) or button click. The 3D view features photorealistic Staunton pieces, soft ray-style lighting, smooth orbital angles, and optimized mobile rendering.',
  },
  {
    id: 'free-tier-limits',
    question: 'Is there a free tier and what is included without paying?',
    answer:
      'Chesswise is free forever to start. Free accounts receive daily spaced repetition puzzles, standard Stockfish game evaluations, basic opening book explorer, and access to all AI coaching features when using your own API key (BYOK). Upgrading to Pro unlocks unlimited server-side cloud Stockfish 18 NNUE, unlimited managed AI coaching, and deep opening repertoire auditing.',
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>('socratic-vs-engine');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={cn(
              'overflow-hidden rounded-xl border transition-all duration-200',
              isOpen
                ? 'border-primary/40 bg-card/80 shadow-md shadow-primary/5'
                : 'border-border/60 bg-card/40 hover:border-border hover:bg-card/60',
            )}
          >
            <button
              type="button"
              onClick={() => toggleItem(faq.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5"
            >
              <div className="flex items-center gap-3 pr-4">
                <span
                  className={cn(
                    'font-serif text-sm font-semibold transition-colors sm:text-base',
                    isOpen ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {faq.question}
                </span>
                {faq.badge && (
                  <span className="hidden shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:inline-block">
                    {faq.badge}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180 text-primary',
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-border/50 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

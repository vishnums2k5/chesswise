'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Target, UploadCloud } from 'lucide-react';

interface OpeningLine {
  id: string;
  eco: string;
  name: string;
  moves: string;
  count: number;
  wins: number;
  draws: number;
  losses: number;
  lastPlayedAt: string;
}

export default function OpeningsPage() {
  const [lines, setLines] = useState<OpeningLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/openings')
      .then((r) => r.json())
      .then((d) => {
        setLines(d.lines ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Mapping your opening repertoire tree…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto my-10 flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-serif text-xl font-bold text-foreground">
          No Opening Repertoire Mapped Yet
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Import your games from Lichess or Chess.com. Chesswise will automatically analyze your
          games, identify your most frequent opening lines, and guard against deviations.
        </p>
        <Link
          href="/import"
          className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Import PGN to Build Repertoire</span>
        </Link>
      </div>
    );
  }

  const totalGames = lines.reduce((acc, l) => acc + l.count, 0);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Repertoire Header Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
              Opening Repertoire &amp; Guardian
            </h1>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Depth 10
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Extracted from {totalGames} games across your imported match history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/import"
            className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent"
          >
            <UploadCloud className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Add More Games</span>
          </Link>
        </div>
      </div>

      {/* Opening Lines Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/50 bg-background/50 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ECO</th>
                <th className="px-4 py-3">Opening Line</th>
                <th className="px-4 py-3 text-right">Games</th>
                <th className="px-4 py-3 text-right">Performance Ratio</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {lines.map((line) => {
                const winPct = line.count > 0 ? (line.wins / line.count) * 100 : 0;
                const drawPct = line.count > 0 ? (line.draws / line.count) * 100 : 0;
                const lossPct = line.count > 0 ? (line.losses / line.count) * 100 : 0;

                return (
                  <tr key={line.id} className="transition-colors hover:bg-muted/15">
                    {/* ECO Code */}
                    <td className="px-4 py-3.5 font-mono font-bold text-primary">
                      <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5">
                        {line.eco}
                      </span>
                    </td>

                    {/* Opening Name & Moves */}
                    <td className="max-w-md px-4 py-3.5">
                      <p className="font-semibold text-foreground">{line.name}</p>
                      <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                        {line.moves}
                      </p>
                    </td>

                    {/* Total Games */}
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-foreground">
                      {line.count}
                    </td>

                    {/* Win/Draw/Loss Bar */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-mono font-bold text-foreground">
                          {winPct.toFixed(0)}%{' '}
                          <span className="text-[10px] font-normal text-muted-foreground">win</span>
                        </span>
                        <div
                          className="flex h-1.5 w-24 overflow-hidden rounded-full bg-muted/50"
                          title={`Wins: ${line.wins} (${winPct.toFixed(0)}%) | Draws: ${line.draws} (${drawPct.toFixed(0)}%) | Losses: ${line.losses} (${lossPct.toFixed(0)}%)`}
                        >
                          <div style={{ width: `${winPct}%` }} className="bg-emerald-400" />
                          <div
                            style={{ width: `${drawPct}%` }}
                            className="bg-muted-foreground/50"
                          />
                          <div style={{ width: `${lossPct}%` }} className="bg-blunder" />
                        </div>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/openings/drill/${line.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                      >
                        <Target className="h-3.5 w-3.5" />
                        <span>Drill</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

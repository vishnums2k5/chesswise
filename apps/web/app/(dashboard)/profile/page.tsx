'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Target,
  BarChart3,
  TrendingUp,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

interface SkillProfile {
  tactics: number;
  strategy: number;
  endgame: number;
  opening: number;
  calculation: number;
  updatedAt: string;
}

const AXES = [
  { key: 'tactics', label: 'Tactics & Vision', color: 'bg-amber-400' },
  { key: 'strategy', label: 'Strategy & Plans', color: 'bg-blue-400' },
  { key: 'endgame', label: 'Endgame Precision', color: 'bg-emerald-400' },
  { key: 'opening', label: 'Opening Repertoire', color: 'bg-purple-400' },
  { key: 'calculation', label: 'Calculation Depth', color: 'bg-pink-400' },
] as const;

// Enhanced SVG Radar Chart with Dark Cyber Aesthetics
function RadarChart({ profile }: { profile: SkillProfile }) {
  const cx = 150,
    cy = 150,
    r = 105;
  const n = AXES.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const rings = [20, 40, 60, 80, 100];

  const getPoint = (angle: number, value: number, maxR = r) => ({
    x: cx + Math.cos(angle) * ((maxR * value) / 100),
    y: cy + Math.sin(angle) * ((maxR * value) / 100),
  });

  const axisPoints = AXES.map((_, i) => ({
    angle: startAngle + i * angleStep,
    outer: getPoint(startAngle + i * angleStep, 100),
    label: getPoint(startAngle + i * angleStep, 122),
  }));

  const dataPoints = AXES.map((axis, i) => {
    const val = profile[axis.key];
    return getPoint(startAngle + i * angleStep, val);
  });

  const dataPath =
    dataPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ') + ' Z';

  return (
    <div className="relative flex justify-center py-2">
      <svg viewBox="0 0 300 300" className="w-full max-w-xs overflow-visible">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C9A24B" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Concentric Polygonal Grid Rings */}
        {rings.map((pct) => {
          const ringPoints = axisPoints
            .map((a) => {
              const p = getPoint(a.angle, pct);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <polygon
              key={`ring-${pct}`}
              points={ringPoints}
              fill="none"
              stroke="#2e3440"
              strokeWidth="0.6"
              strokeDasharray={pct === 100 ? undefined : '2 2'}
            />
          );
        })}

        {/* Radial Axis Rays */}
        {axisPoints.map((a, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={a.outer.x}
            y2={a.outer.y}
            stroke="#2e3440"
            strokeWidth="0.8"
          />
        ))}

        {/* Filled Data Polygon with Glow */}
        <path d={dataPath} fill="url(#radarGlow)" stroke="#C9A24B" strokeWidth="2" />

        {/* Vertex Dots */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill="#C9A24B"
            stroke="#ffffff"
            strokeWidth="0.8"
          />
        ))}

        {/* Axis Labels */}
        {axisPoints.map((a, i) => (
          <text
            key={i}
            x={a.label.x}
            y={a.label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9.5}
            fill="#EDE6D6"
            className="font-medium tracking-tight"
          >
            {AXES[i]!.label.split(' ')[0]}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [gameCount, setGameCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [puzzleStats, setPuzzleStats] = useState<{
    dueToday: number;
    streak: number;
    totalSolved: number;
    accuracy7d: number | null;
  } | null>(null);
  const [userXp, setUserXp] = useState<{ xp: number; level: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/profile')
        .then((r) => r.json())
        .catch(() => null),
      fetch('/api/games')
        .then((r) => r.json())
        .catch(() => ({ games: [] })),
      fetch('/api/puzzles/stats')
        .then((r) => r.json())
        .catch(() => null),
      fetch('/api/settings')
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([profileData, gamesData, statsData, settingsData]) => {
        setProfile(profileData?.profile ?? null);
        setGameCount(gamesData?.games?.length ?? 0);
        setPuzzleStats(statsData ?? null);
        if (settingsData?.settings) {
          setUserXp({ xp: settingsData.settings.xp, level: settingsData.settings.level });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Synthesizing skill telemetry…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
            Skill DNA &amp; Telemetry
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Calibrated dynamically across {gameCount} analyzed game{gameCount !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Level and XP Meter */}
        {userXp && (
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
              Lv {userXp.level}
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Level {userXp.level} Tactician</span>
                <span className="font-mono text-primary">{userXp.xp.toLocaleString()} XP</span>
              </div>
              <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((userXp.xp % 1000) / 1000) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {!profile ? (
        <div className="mx-auto my-8 flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-serif text-lg font-bold text-foreground">
            No Match Telemetry Available
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Import your games to build your tactical radar profile and calibrate your personal
            Mirror Bot.
          </p>
          <Link
            href="/import"
            className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import Your First Game</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Radar Chart Card */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-foreground">
                Tactical Radar Profile
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Multi-Axis Balance
              </span>
            </div>
            <RadarChart profile={profile} />
          </div>

          {/* Proficiency Breakdown Bars */}
          <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div>
              <h3 className="mb-4 font-serif text-base font-bold text-foreground">
                Proficiency Scores
              </h3>

              <div className="space-y-4">
                {AXES.map((axis) => {
                  const val = profile[axis.key];
                  return (
                    <div key={axis.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground/90">{axis.label}</span>
                        <span className="font-mono font-bold text-primary">
                          {val.toFixed(0)} / 100
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                        <div
                          className={`h-full rounded-full ${axis.color} transition-all duration-700 ease-out`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {profile.updatedAt && (
              <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                <span>Calibrated from Stockfish telemetry</span>
                <span className="font-mono">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* 7-Day Performance Stats (Span 2) */}
          {puzzleStats && (
            <div className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm lg:col-span-2">
              <h3 className="mb-4 font-serif text-base font-bold text-foreground">
                Training Telemetry &amp; Consistency
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Streak
                    </span>
                    <Flame className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-primary">
                    {puzzleStats.streak}d
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Consecutive days</p>
                </div>

                <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Due Flashcards
                    </span>
                    <Target className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-amber-400">
                    {puzzleStats.dueToday}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Pending review</p>
                </div>

                <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Total Solved
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                    {puzzleStats.totalSolved}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Mastered reps</p>
                </div>

                <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      7d Accuracy
                    </span>
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-foreground">
                    {puzzleStats.accuracy7d != null ? `${puzzleStats.accuracy7d}%` : 'N/A'}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Recent solves</p>
                </div>
              </div>

              {puzzleStats.dueToday > 0 && (
                <div className="mt-5 flex justify-end">
                  <Link
                    href="/train"
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    <span>Launch Daily Gym ({puzzleStats.dueToday} due)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

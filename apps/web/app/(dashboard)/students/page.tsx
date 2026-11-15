'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Users, ShieldAlert } from 'lucide-react';

interface SkillProfile {
  tactics: number;
  strategy: number;
  endgame: number;
  opening: number;
  calculation: number;
}

interface Student {
  id: string;
  displayName: string | null;
  email: string;
  xp: number;
  level: number;
  skillProfile: SkillProfile | null;
  _count: { games: number };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/students')
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 403)
            throw new Error('You must have the COACH role to view this roster.');
          throw new Error('Failed to load students');
        }
        return r.json();
      })
      .then((d) => setStudents(d.students || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const getWeakestAxis = (profile: SkillProfile) => {
    const axes = [
      { k: 'Tactics', v: profile.tactics },
      { k: 'Strategy', v: profile.strategy },
      { k: 'Endgame', v: profile.endgame },
      { k: 'Opening', v: profile.opening },
      { k: 'Calculation', v: profile.calculation },
    ];
    return axes.reduce((prev, curr) => (curr.v < prev.v ? curr : prev));
  };

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading student roster telemetry…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-blunder/30 bg-blunder/10 p-6 text-center text-xs text-blunder">
        <ShieldAlert className="mx-auto mb-2 h-8 w-8" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
              Student Coaching Roster
            </h1>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Coach Portal
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Monitor training readiness, aggregate tactical weak points, and game analysis volume.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Users className="h-4 w-4 text-primary" />
          <span>{students.length} active students</span>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="mx-auto my-8 flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-serif text-lg font-bold text-foreground">
            No Students Linked Yet
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Students can assign your Coach ID in their account settings to grant you oversight over
            their match reports and tactical radar.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/50 bg-background/50 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Level &amp; XP</th>
                  <th className="px-5 py-3.5 text-right">Analyzed Games</th>
                  <th className="px-5 py-3.5">Primary Weak Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {students.map((s) => {
                  const weakest = s.skillProfile ? getWeakestAxis(s.skillProfile) : null;
                  const name = s.displayName || s.email.split('@')[0] || 'Student';

                  return (
                    <tr key={s.id} className="transition-colors hover:bg-muted/15">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-serif text-xs font-bold text-primary">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{name}</p>
                            <p className="text-[11px] text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                            Lv {s.level}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {s.xp.toLocaleString()} XP
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-foreground">
                        {s._count.games}
                      </td>

                      <td className="px-5 py-3.5">
                        {weakest ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blunder/30 bg-blunder/10 px-2.5 py-0.5 font-semibold text-blunder">
                            <span>{weakest.k}</span>
                            <span className="font-mono opacity-80">
                              ({Math.round(weakest.v)}/100)
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Calibrating…</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

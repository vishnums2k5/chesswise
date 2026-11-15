'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  UploadCloud,
  Globe,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

type Tab = 'paste' | 'username' | 'my-games';
type GameStatus =
  | 'IMPORTED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'ANALYSIS_COMPLETE'
  | 'EXPLANATION_READY'
  | 'PROFILE_UPDATED'
  | 'PROCESSING_FAILED';

interface GameSummary {
  id: string;
  headers: Record<string, string>;
  status: GameStatus;
  accuracy: number | null;
  importedAt: string;
}

const STATUS_LABELS: Record<GameStatus, string> = {
  IMPORTED: 'Imported',
  QUEUED: 'Queued',
  PROCESSING: 'Analyzing…',
  ANALYSIS_COMPLETE: 'Engine complete',
  EXPLANATION_READY: 'Report ready',
  PROFILE_UPDATED: 'Complete',
  PROCESSING_FAILED: 'Failed',
};

const DONE_STATUSES: GameStatus[] = ['EXPLANATION_READY', 'PROFILE_UPDATED'];

export default function ImportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('paste');

  // Paste / upload state
  const [pgn, setPgn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<GameStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Username fetch state
  const [username, setUsername] = useState('');
  const [source, setSource] = useState<'lichess' | 'chess.com'>('lichess');
  const [fetchLimit, setFetchLimit] = useState(5);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // My games state
  const [games, setGames] = useState<GameSummary[]>([]);
  const [gamesLoaded, setGamesLoaded] = useState(false);

  const startPolling = (gameId: string) => {
    setPendingGameId(gameId);
    setAnalysisStatus('QUEUED');
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/games/${gameId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      setAnalysisStatus(data.status);
      if (DONE_STATUSES.includes(data.status) || data.status === 'PROCESSING_FAILED') {
        if (pollRef.current) clearInterval(pollRef.current);
        if (DONE_STATUSES.includes(data.status)) {
          setTimeout(() => router.push(`/report/${gameId}`), 700);
        }
      }
    }, 2000);
  };

  const handlePgnSubmit = async () => {
    if (!pgn.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/games/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Import failed');
      startPolling(data.gameId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPgn((ev.target?.result as string) ?? '');
    reader.readAsText(file);
  }, []);

  const handleUsernameFetch = async () => {
    if (!username.trim()) return;
    setFetchError('');
    setFetchLoading(true);
    try {
      let gamesData: string[] = [];

      if (source === 'lichess') {
        const res = await fetch(
          `https://lichess.org/api/games/user/${username}?max=${fetchLimit}&pgnInJson=false`,
          { headers: { Accept: 'application/x-ndjson' } },
        );
        if (!res.ok) throw new Error('Failed to fetch from Lichess');
        const text = await res.text();
        gamesData = text.split('\n\n\n').filter(Boolean);
      } else {
        const archivesRes = await fetch(
          `https://api.chess.com/pub/player/${username}/games/archives`,
        );
        if (!archivesRes.ok) throw new Error('Player not found on Chess.com');
        const archivesData = await archivesRes.json();
        const latestArchive = archivesData.archives?.[archivesData.archives.length - 1];
        if (!latestArchive) throw new Error('No games found in archives');
        const gamesRes = await fetch(`${latestArchive}/pgn`);
        const pgnsText = await gamesRes.text();
        gamesData = pgnsText
          .split('[Event "')
          .filter(Boolean)
          .map((s) => '[Event "' + s.trim())
          .reverse()
          .slice(0, fetchLimit);
      }

      if (gamesData.length === 0) throw new Error('No games found for this user');

      let importedCount = 0;
      let lastGameId = '';
      for (const gamePgn of gamesData.slice(0, fetchLimit)) {
        const res = await fetch('/api/games/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pgn: gamePgn }),
        });
        if (res.ok) {
          const d = await res.json();
          lastGameId = d.gameId;
          importedCount++;
        }
      }

      if (importedCount === 0) throw new Error('Failed to import any games');
      if (lastGameId) startPolling(lastGameId);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setFetchLoading(false);
    }
  };

  const loadMyGames = async () => {
    try {
      const res = await fetch('/api/games');
      if (res.ok) {
        const data = await res.json();
        setGames(data.games ?? []);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setGamesLoaded(true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Import &amp; Analyze Matches
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Upload PGN notation files or sync directly from Lichess / Chess.com to generate deep
          Stockfish move analysis, mistake flashcards, and audio recaps.
        </p>
      </div>

      {/* Analysis Live Status Banner */}
      {pendingGameId && analysisStatus && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-md backdrop-blur-md transition-all',
            DONE_STATUSES.includes(analysisStatus)
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : analysisStatus === 'PROCESSING_FAILED'
                ? 'border-blunder/40 bg-blunder/10 text-blunder'
                : 'border-primary/40 bg-primary/10 text-primary',
          )}
        >
          {DONE_STATUSES.includes(analysisStatus) && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          )}
          {analysisStatus === 'PROCESSING_FAILED' && (
            <XCircle className="h-5 w-5 shrink-0 text-blunder" />
          )}
          {!DONE_STATUSES.includes(analysisStatus) && analysisStatus !== 'PROCESSING_FAILED' && (
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}

          <div>
            <p className="font-semibold text-foreground">
              {DONE_STATUSES.includes(analysisStatus)
                ? 'Analysis Complete! Launching your personalized report…'
                : analysisStatus === 'PROCESSING_FAILED'
                  ? 'Analysis processing failed. Please check the PGN formatting.'
                  : `Cloud Engine: ${STATUS_LABELS[analysisStatus]}`}
            </p>
            <p className="text-[11px] font-normal text-muted-foreground">
              Calculating centipawn swings, blunder tactical motifs, and Socratic advice.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        {(
          [
            ['paste', 'Paste / Upload PGN', FileText],
            ['username', 'Lichess / Chess.com Sync', Globe],
            ['my-games', 'My Analyzed Matches', BarChart3],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              if (id === 'my-games' && !gamesLoaded) loadMyGames();
            }}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all',
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Paste / Upload */}
      {tab === 'paste' && (
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <textarea
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            placeholder={`[Event "Live Chess Match"]\n[White "MagnusCarlsen"]\n[Black "Hikaru"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 ...`}
            rows={9}
            className="w-full resize-y rounded-xl border border-border/70 bg-background/60 p-4 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-background/40 px-4 py-3 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground">
              <UploadCloud className="h-4 w-4 text-primary" />
              <span>Drop a .pgn file or click to browse</span>
              <input type="file" accept=".pgn" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handlePgnSubmit}
              disabled={!pgn.trim() || loading || !!pendingGameId}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'Uploading…' : 'Analyze Match'}</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-blunder">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: Username fetch */}
      {tab === 'username' && (
        <div className="space-y-5 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setSource('lichess')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all',
                source === 'lichess'
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border/60 bg-background/40 text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Lichess.org</span>
            </button>
            <button
              onClick={() => setSource('chess.com')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all',
                source === 'chess.com'
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border/60 bg-background/40 text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Chess.com</span>
            </button>
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameFetch()}
            placeholder={`Enter ${source === 'lichess' ? 'Lichess' : 'Chess.com'} handle…`}
            className="w-full rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Recent games:</span>
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setFetchLimit(n)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-all',
                    fetchLimit === n
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={handleUsernameFetch}
              disabled={!username.trim() || fetchLoading || !!pendingGameId}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40"
            >
              {fetchLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Fetching…</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Fetch &amp; Analyze</span>
                </>
              )}
            </button>
          </div>

          {fetchError && (
            <div className="flex items-center gap-1.5 text-xs text-blunder">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: My Games */}
      {tab === 'my-games' && (
        <div className="space-y-4">
          {!gamesLoaded ? (
            <div className="flex h-48 animate-pulse items-center justify-center text-xs text-muted-foreground">
              Loading your match archive…
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
              No games imported yet. Use the Paste or Username tab above to analyze your first
              match!
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/50 bg-background/50 font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Accuracy</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {games.map((g) => {
                    const h = g.headers as Record<string, string>;
                    const isDone = DONE_STATUSES.includes(g.status);
                    return (
                      <tr
                        key={g.id}
                        onClick={() => isDone && router.push(`/report/${g.id}`)}
                        className={cn(
                          'transition-colors',
                          isDone ? 'cursor-pointer hover:bg-muted/15' : '',
                        )}
                      >
                        <td className="px-4 py-3.5 font-medium text-foreground">
                          {h['White'] ?? 'White'} vs {h['Black'] ?? 'Black'}
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            {h['Result'] ?? '*'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {h['Date'] ?? new Date(g.importedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                          {g.accuracy != null ? `${g.accuracy.toFixed(1)}%` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              isDone
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : g.status === 'PROCESSING_FAILED'
                                  ? 'bg-blunder/10 text-blunder'
                                  : 'bg-primary/10 text-primary',
                            )}
                          >
                            {STATUS_LABELS[g.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={loadMyGames}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Archive</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

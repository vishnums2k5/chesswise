import { Chess } from 'chess.js';
import { spawn, ChildProcess } from 'child_process';

export interface MoveAnalysis {
  evalBefore: number | null; // centipawns, null if mate
  evalAfter: number | null;
  bestMoveUci: string | null;
  bestMoveSan: string | null;
}

interface StockfishResult {
  evalCp: number | null;
  bestMoveUci: string | null;
}

/**
 * Reusable, persistent Stockfish engine process.
 * Keeps a single process running to prevent high-memory WASM reloads and CPU thrashing.
 */
class PersistentEngine {
  private proc: ChildProcess | null = null;
  private buffer = '';
  private pending: ((res: StockfishResult) => void) | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;

  private spawnProcess(): ChildProcess {
    if (process.env.STOCKFISH_PATH) {
      return spawn(process.env.STOCKFISH_PATH);
    }
    try {
      const scriptPath = require.resolve('stockfish/bin/stockfish.js');
      return spawn(process.execPath, [scriptPath]);
    } catch {
      return spawn('stockfish');
    }
  }

  private initProcess(): ChildProcess {
    if (this.proc && !this.proc.killed) return this.proc;
    this.buffer = '';
    this.proc = this.spawnProcess();

    this.proc.stdout?.on('data', (d: Buffer) => {
      this.buffer += d.toString();
      this.checkBuffer();
    });

    this.proc.on('error', (err) => {
      console.warn('[stockfish] Process error:', err);
      this.kill();
    });

    this.proc.on('exit', () => {
      this.proc = null;
    });

    this.proc.stdin?.write('uci\nisready\n');
    return this.proc;
  }

  private checkBuffer() {
    if (!this.pending) return;
    const lines = this.buffer.split('\n');
    let bestMoveUci: string | null = null;
    let evalCp: number | null = null;

    for (const l of lines) {
      const cpMatch = l.match(/score cp (-?\d+)/);
      const mateMatch = l.match(/score mate (-?\d+)/);
      if (cpMatch) evalCp = parseInt(cpMatch[1]!, 10);
      if (mateMatch) evalCp = parseInt(mateMatch[1]!, 10) > 0 ? 30000 : -30000;

      if (l.startsWith('bestmove')) {
        const parts = l.trim().split(' ');
        bestMoveUci = parts[1] !== '(none)' ? (parts[1] ?? null) : null;
        if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
        const resolve = this.pending;
        this.pending = null;
        this.buffer = '';
        resolve({ evalCp, bestMoveUci });
        return;
      }
    }
  }

  public async evaluate(fen: string, depth: number, timeLimitMs = 5000): Promise<StockfishResult> {
    const proc = this.initProcess();
    return new Promise((resolve) => {
      this.pending = resolve;
      this.buffer = '';

      this.timeoutTimer = setTimeout(() => {
        if (this.pending) {
          proc.stdin?.write('stop\n');
        }
      }, timeLimitMs);

      proc.stdin?.write(`position fen ${fen}\ngo depth ${depth}\n`);
    });
  }

  public kill() {
    if (this.proc) {
      try {
        this.proc.kill();
      } catch {}
      this.proc = null;
    }
    this.pending = null;
    this.buffer = '';
  }
}

const engine = new PersistentEngine();

/**
 * Analyzes a position before and after a move using the persistent engine.
 */
export async function analyzePosition(
  fenBefore: string,
  playedMoveUci: string,
  depth = 14,
  timeLimitMs = 5000,
): Promise<MoveAnalysis> {
  // 1. Evaluate fenBefore (mover perspective & best move)
  const beforeResult = await engine.evaluate(fenBefore, depth, timeLimitMs);

  // 2. Play the move to get fenAfter
  const game = new Chess(fenBefore);
  const from = playedMoveUci.slice(0, 2);
  const to = playedMoveUci.slice(2, 4);
  const promotion = playedMoveUci[4];
  game.move({ from, to, promotion });
  const fenAfter = game.fen();

  // 3. Evaluate fenAfter (opponent perspective)
  const afterResult = await engine.evaluate(fenAfter, depth, timeLimitMs);

  // Convert bestMove UCI to SAN
  let bestMoveSan: string | null = null;
  if (beforeResult.bestMoveUci) {
    try {
      const g = new Chess(fenBefore);
      const bFrom = beforeResult.bestMoveUci.slice(0, 2);
      const bTo = beforeResult.bestMoveUci.slice(2, 4);
      const bPromo = beforeResult.bestMoveUci[4];
      const move = g.move({ from: bFrom, to: bTo, promotion: bPromo });
      bestMoveSan = move?.san ?? null;
    } catch {
      bestMoveSan = null;
    }
  }

  return {
    evalBefore: beforeResult.evalCp,
    evalAfter: afterResult.evalCp,
    bestMoveUci: beforeResult.bestMoveUci,
    bestMoveSan,
  };
}

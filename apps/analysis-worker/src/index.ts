import http from 'http';
import { startWorker, processGame, prisma } from './worker';

const PORT = parseInt(process.env.PORT || '3001', 10);
const REDIS_URL = process.env.REDIS_URL;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10);

console.log('[analysis-worker] 🚀 Chesswise Analysis Worker starting...');
console.log(`[analysis-worker] Port: ${PORT}`);
console.log(
  `[analysis-worker] Redis: ${REDIS_URL ? 'Configured' : 'Not configured (using DB polling)'}`,
);
console.log(`[analysis-worker] Analysis depth: ${process.env.ANALYSIS_DEPTH ?? '14'}`);

let isProcessing = false;

export async function processNextQueuedGame(): Promise<boolean> {
  if (isProcessing) return false;
  isProcessing = true;
  try {
    const nextGame = await prisma.game.findFirst({
      where: { status: 'QUEUED' },
      select: { id: true, headers: true },
      orderBy: { importedAt: 'desc' },
    });

    if (!nextGame) {
      return false;
    }

    const h = (nextGame.headers ?? {}) as Record<string, string>;
    console.log(
      `[analysis-worker] Found queued game ${nextGame.id}: ${h['White'] ?? 'White'} vs ${h['Black'] ?? 'Black'}`,
    );
    await processGame(nextGame.id);
    console.log(`[analysis-worker] Finished processing game ${nextGame.id}`);
    return true;
  } catch (err) {
    console.error('[analysis-worker] Error processing queued game:', err);
    return false;
  } finally {
    isProcessing = false;
  }
}

// 1. Health check HTTP server for Render Web Service
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

  if (url.pathname === '/health' || url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'chesswise-analysis-worker',
        isProcessing,
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  if (url.pathname === '/analyze') {
    // Trigger immediate background process
    processNextQueuedGame().catch(console.error);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Analysis triggered', isProcessing }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[analysis-worker] 🌐 Health server listening on 0.0.0.0:${PORT}`);
});

// 2. Start BullMQ worker if REDIS_URL is configured
if (REDIS_URL) {
  try {
    startWorker();
    console.log('[analysis-worker] BullMQ worker connected to Redis');
  } catch (err) {
    console.warn('[analysis-worker] Could not start BullMQ worker:', err);
  }
}

// 3. Continuous background database poller
setInterval(async () => {
  await processNextQueuedGame();
}, POLL_INTERVAL_MS);

// Run initial check on startup
processNextQueuedGame().catch(console.error);

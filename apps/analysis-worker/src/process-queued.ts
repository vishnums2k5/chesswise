import { processGame, prisma } from './worker';

async function main() {
  const arg = process.argv[2];
  const isAll = arg === '--all' || process.argv[3] === '--all';
  const targetGameId = arg && !arg.startsWith('--') ? arg : null;

  if (targetGameId) {
    console.log(`[analyze] Processing specific game: ${targetGameId}`);
    await processGame(targetGameId);
    console.log(`[analyze] Done processing game ${targetGameId}!`);
    return;
  }

  console.log('[analyze] Searching for pending QUEUED games in database...');
  const limit = isAll ? undefined : 10;
  const queuedGames = await prisma.game.findMany({
    where: { status: 'QUEUED' },
    select: { id: true, headers: true, importedAt: true },
    orderBy: { importedAt: 'desc' },
    take: limit,
  });

  if (queuedGames.length === 0) {
    console.log('[analyze] No queued games found. Everything is up to date!');
    return;
  }

  console.log(
    `[analyze] Found ${queuedGames.length} queued game(s) to analyze (most recent first).\n`,
  );

  for (let i = 0; i < queuedGames.length; i++) {
    const g = queuedGames[i]!;
    const h = (g.headers ?? {}) as Record<string, string>;
    const matchLabel = `${h['White'] ?? 'White'} vs ${h['Black'] ?? 'Black'} (${h['Date'] ?? 'Recent'})`;
    console.log(`--------------------------------------------------`);
    console.log(`[analyze] (${i + 1}/${queuedGames.length}) Processing game ${g.id}`);
    console.log(`[analyze] Match: ${matchLabel}`);
    try {
      await processGame(g.id);
      console.log(`[analyze] Successfully analyzed game ${g.id}!`);
    } catch (err) {
      console.error(`[analyze] Failed to analyze game ${g.id}:`, err);
    }
  }

  console.log(`--------------------------------------------------`);
  console.log(`[analyze] Done! Refresh your report page to view your deep report.`);
}

main()
  .catch((e) => {
    console.error('[analyze] Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { awardXp, XP_REWARDS } from '@/lib/xp';
import { sm2Update } from '@/lib/sm2';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ puzzleId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { puzzleId } = await params;
  const body = await req.json();
  const { correct } = body as { correct: boolean };

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const puzzle = await prisma.puzzleCard.findFirst({
    where: { id: puzzleId, userId: dbUser.id },
  });
  if (!puzzle) return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });

  const { interval, easeFactor, nextReviewAt, solvedCount } = sm2Update(
    correct,
    puzzle.interval,
    puzzle.easeFactor,
    puzzle.solvedCount,
  );

  await prisma.puzzleCard.update({
    where: { id: puzzleId },
    data: { interval, easeFactor, nextReviewAt, solvedCount },
  });

  // Write audit log entry
  await prisma.auditLog.create({
    data: {
      userId: dbUser.id,
      entityType: 'puzzle',
      entityId: puzzleId,
      action: correct ? 'puzzle_solved' : 'puzzle_failed',
      metadata: { correct, newInterval: interval, newEaseFactor: easeFactor },
    },
  });

  // Award XP for correct solve
  let xpResult: { xp: number; level: number; leveledUp: boolean } | null = null;
  if (correct) {
    xpResult = await awardXp(dbUser.id, XP_REWARDS.PUZZLE_CORRECT);
  }

  return NextResponse.json({
    success: true,
    nextReviewAt,
    interval,
    xp: xpResult,
    message: correct
      ? `✅ Correct! Next review in ${interval} day${interval === 1 ? '' : 's'}`
      : `❌ Try again. Due again tomorrow.`,
  });
}

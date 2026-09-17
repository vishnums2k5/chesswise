import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        displayName: true,
        avatarUrl: true,
        email: true,
        lichessUsername: true,
        chessComUsername: true,
        xp: true,
        level: true,
      },
    });

    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ settings: dbUser });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { displayName, avatarUrl, lichessUsername, chessComUsername } = body as {
      displayName?: string;
      avatarUrl?: string;
      lichessUsername?: string;
      chessComUsername?: string;
    };

    const updated = await prisma.user.upsert({
      where: { supabaseId: user.id },
      create: {
        supabaseId: user.id,
        email: user.email ?? 'unknown@example.com',
        displayName: displayName?.trim() || user.user_metadata?.full_name || 'Player',
        avatarUrl: avatarUrl?.trim() || null,
        lichessUsername: lichessUsername?.trim() || null,
        chessComUsername: chessComUsername?.trim() || null,
      },
      update: {
        ...(displayName !== undefined && { displayName: displayName.trim() || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl.trim() || null }),
        ...(lichessUsername !== undefined && { lichessUsername: lichessUsername.trim() || null }),
        ...(chessComUsername !== undefined && {
          chessComUsername: chessComUsername.trim() || null,
        }),
      },
      select: { displayName: true, avatarUrl: true, lichessUsername: true, chessComUsername: true },
    });

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

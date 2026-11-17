import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { maskApiKey, isLikelyApiKey } from '@/lib/key-security';

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
        aiProvider: true,
        geminiApiKey: true,
        openaiApiKey: true,
        openrouterApiKey: true,
        customModel: true,
      },
    });

    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const safeSettings = {
      displayName: dbUser.displayName,
      avatarUrl: dbUser.avatarUrl,
      email: dbUser.email,
      lichessUsername: dbUser.lichessUsername,
      chessComUsername: dbUser.chessComUsername,
      xp: dbUser.xp,
      level: dbUser.level,
      aiProvider: dbUser.aiProvider || 'gemini',
      customModel: dbUser.customModel || '',
      hasGeminiApiKey: Boolean(dbUser.geminiApiKey),
      geminiApiKeyMasked: maskApiKey(dbUser.geminiApiKey),
      hasOpenaiApiKey: Boolean(dbUser.openaiApiKey),
      openaiApiKeyMasked: maskApiKey(dbUser.openaiApiKey),
      hasOpenrouterApiKey: Boolean(dbUser.openrouterApiKey),
      openrouterApiKeyMasked: maskApiKey(dbUser.openrouterApiKey),
    };

    return NextResponse.json({ settings: safeSettings });
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
    const {
      displayName,
      avatarUrl,
      lichessUsername,
      chessComUsername,
      aiProvider,
      customModel,
      geminiApiKey,
      openaiApiKey,
      openrouterApiKey,
      removeGeminiApiKey,
      removeOpenaiApiKey,
      removeOpenrouterApiKey,
    } = body as {
      displayName?: string;
      avatarUrl?: string;
      lichessUsername?: string;
      chessComUsername?: string;
      aiProvider?: string;
      customModel?: string;
      geminiApiKey?: string;
      openaiApiKey?: string;
      openrouterApiKey?: string;
      removeGeminiApiKey?: boolean;
      removeOpenaiApiKey?: boolean;
      removeOpenrouterApiKey?: boolean;
    };

    const updateData: Record<string, any> = {};

    if (displayName !== undefined) updateData.displayName = displayName.trim() || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim() || null;
    if (lichessUsername !== undefined) updateData.lichessUsername = lichessUsername.trim() || null;
    if (chessComUsername !== undefined)
      updateData.chessComUsername = chessComUsername.trim() || null;

    if (aiProvider !== undefined) {
      const valid = ['gemini', 'openai', 'openrouter'].includes(aiProvider) ? aiProvider : 'gemini';
      updateData.aiProvider = valid;
    }

    if (customModel !== undefined) {
      updateData.customModel = customModel.trim() || null;
    }

    // Secure key handling: only update if a new valid unmasked key is provided
    if (removeGeminiApiKey) {
      updateData.geminiApiKey = null;
    } else if (geminiApiKey !== undefined && isLikelyApiKey(geminiApiKey)) {
      updateData.geminiApiKey = geminiApiKey.trim();
    }

    if (removeOpenaiApiKey) {
      updateData.openaiApiKey = null;
    } else if (openaiApiKey !== undefined && isLikelyApiKey(openaiApiKey)) {
      updateData.openaiApiKey = openaiApiKey.trim();
    }

    if (removeOpenrouterApiKey) {
      updateData.openrouterApiKey = null;
    } else if (openrouterApiKey !== undefined && isLikelyApiKey(openrouterApiKey)) {
      updateData.openrouterApiKey = openrouterApiKey.trim();
    }

    const updated = await prisma.user.upsert({
      where: { supabaseId: user.id },
      create: {
        supabaseId: user.id,
        email: user.email ?? 'unknown@example.com',
        displayName: displayName?.trim() || user.user_metadata?.full_name || 'Player',
        avatarUrl: avatarUrl?.trim() || null,
        lichessUsername: lichessUsername?.trim() || null,
        chessComUsername: chessComUsername?.trim() || null,
        aiProvider: updateData.aiProvider || 'gemini',
        customModel: updateData.customModel || null,
        geminiApiKey: updateData.geminiApiKey || null,
        openaiApiKey: updateData.openaiApiKey || null,
        openrouterApiKey: updateData.openrouterApiKey || null,
      },
      update: updateData,
      select: {
        displayName: true,
        avatarUrl: true,
        lichessUsername: true,
        chessComUsername: true,
        aiProvider: true,
        customModel: true,
        geminiApiKey: true,
        openaiApiKey: true,
        openrouterApiKey: true,
      },
    });

    return NextResponse.json({
      settings: {
        displayName: updated.displayName,
        avatarUrl: updated.avatarUrl,
        lichessUsername: updated.lichessUsername,
        chessComUsername: updated.chessComUsername,
        aiProvider: updated.aiProvider,
        customModel: updated.customModel,
        hasGeminiApiKey: Boolean(updated.geminiApiKey),
        geminiApiKeyMasked: maskApiKey(updated.geminiApiKey),
        hasOpenaiApiKey: Boolean(updated.openaiApiKey),
        openaiApiKeyMasked: maskApiKey(updated.openaiApiKey),
        hasOpenrouterApiKey: Boolean(updated.openrouterApiKey),
        openrouterApiKeyMasked: maskApiKey(updated.openrouterApiKey),
      },
    });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

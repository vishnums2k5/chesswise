import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { testLlmKey, AiProvider, resolveApiKey } from '@/lib/llm-provider';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { provider, apiKey, customModel } = body as {
      provider: AiProvider;
      apiKey?: string;
      customModel?: string;
    };

    if (!provider || !['gemini', 'openai', 'openrouter'].includes(provider)) {
      return NextResponse.json({ ok: false, error: 'Invalid provider specified' }, { status: 400 });
    }

    let effectiveKey = apiKey?.trim();
    const headerKey = req.headers.get('x-user-api-key')?.trim();
    if (headerKey && !effectiveKey) effectiveKey = headerKey;

    // If key is masked or omitted, check database for saved key
    if (!effectiveKey || effectiveKey.includes('••••')) {
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: {
          geminiApiKey: true,
          openaiApiKey: true,
          openrouterApiKey: true,
        },
      });

      if (provider === 'gemini') effectiveKey = dbUser?.geminiApiKey || undefined;
      else if (provider === 'openai') effectiveKey = dbUser?.openaiApiKey || undefined;
      else if (provider === 'openrouter') effectiveKey = dbUser?.openrouterApiKey || undefined;
    }

    // Resolve key including environment fallback
    const resolved = resolveApiKey(provider, effectiveKey);
    if (!resolved) {
      return NextResponse.json({
        ok: false,
        error: `No API key provided or found for ${provider}. Please enter a key.`,
      });
    }

    const result = await testLlmKey(provider, resolved, customModel);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Test key route error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to validate API key.' },
      { status: 500 },
    );
  }
}

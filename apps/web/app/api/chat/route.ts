import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { buildCoachContext } from '@/lib/coach-context';
import {
  streamLlmResponse,
  AiProvider,
  resolveApiKey,
  PROVIDER_LABELS,
  ChatMessageTurn,
} from '@/lib/llm-provider';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { message, sessionId, gameId, fen } = body as {
    message: string;
    sessionId?: string;
    gameId?: string;
    fen?: string;
  };

  if (!message?.trim()) return new Response('message is required', { status: 400 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      aiProvider: true,
      geminiApiKey: true,
      openaiApiKey: true,
      openrouterApiKey: true,
      customModel: true,
    },
  });
  if (!dbUser) return new Response('User not found', { status: 404 });

  // Get or create chat session
  let session;
  if (sessionId) {
    session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: dbUser.id },
    });
  }
  if (!session) {
    const title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
    session = await prisma.chatSession.create({
      data: {
        userId: dbUser.id,
        gameId: gameId ?? null,
        title,
      },
    });
  }

  // Persist user message
  await prisma.chatMessage.create({
    data: { sessionId: session.id, role: 'USER', content: message },
  });

  // Load message history (last 20 turns for context window)
  const history = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  // Build grounded RAG context from games, skill profile, and board state
  const { systemPrompt } = await buildCoachContext(dbUser.id, {
    gameId: gameId ?? session.gameId ?? undefined,
    fen,
  });

  // Determine active AI provider and key
  const provider = (dbUser.aiProvider || 'gemini') as AiProvider;
  let customKey: string | null = null;
  if (provider === 'gemini') customKey = dbUser.geminiApiKey;
  else if (provider === 'openai') customKey = dbUser.openaiApiKey;
  else if (provider === 'openrouter') customKey = dbUser.openrouterApiKey;

  const apiKey = resolveApiKey(provider, customKey);

  if (!apiKey) {
    // Graceful degradation when key is missing
    const providerName = PROVIDER_LABELS[provider] || provider;
    const fallback = `I'm sorry, no API key is configured for ${providerName}. Please add your API key in Settings > AI & RAG Configuration to activate coaching.`;

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: 'ASSISTANT', content: fallback },
    });
    return new Response(
      `data: ${JSON.stringify({ text: fallback, sessionId: session.id, done: true })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream' } },
    );
  }

  // Format history for LLM (exclude the message we just saved)
  const chatHistory: ChatMessageTurn[] = history.slice(0, -1).map((m) => ({
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
  }));

  // Stream response as SSE
  const encoder = new TextEncoder();
  let fullResponse = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const streamGenerator = streamLlmResponse({
          provider,
          apiKey,
          customModel: dbUser.customModel,
          systemPrompt,
          history: chatHistory,
          message,
        });

        for await (const chunk of streamGenerator) {
          fullResponse += chunk;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk, sessionId: session!.id })}\n\n`),
          );
        }

        // Persist the full assistant response
        if (fullResponse.trim()) {
          await prisma.chatMessage.create({
            data: { sessionId: session!.id, role: 'ASSISTANT', content: fullResponse },
          });
        }

        // Auto-update session title from first message if default
        if (session!.title === 'New conversation') {
          await prisma.chatSession.update({
            where: { id: session!.id },
            data: { title: message.slice(0, 60) },
          });
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: session!.id })}\n\n`),
        );
      } catch (err: any) {
        console.error(`[chat] ${provider} error:`, err);
        const errMsg =
          err?.message || 'Coach encountered an error. Please check your API key in Settings.';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errMsg, done: true })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

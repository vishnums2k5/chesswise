import { GoogleGenerativeAI } from '@google/generative-ai';

export type AiProvider = 'gemini' | 'openai' | 'openrouter';

export interface ChatMessageTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmRequestOptions {
  provider: AiProvider;
  apiKey?: string | null;
  customModel?: string | null;
  systemPrompt: string;
  history: ChatMessageTurn[];
  message: string;
}

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  gemini: 'gemini-1.5-flash',
  openai: 'gpt-4o-mini',
  openrouter: 'meta-llama/llama-3.3-70b-instruct',
};

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: 'Google Gemini (Google AI Studio)',
  openai: 'OpenAI (ChatGPT API)',
  openrouter: 'OpenRouter (Universal Model Gateway)',
};

/**
 * Resolves the effective API key for a provider, falling back to server environment variables if available.
 */
export function resolveApiKey(provider: AiProvider, customKey?: string | null): string | null {
  const trimmed = customKey?.trim();
  if (trimmed && !trimmed.includes('••••')) {
    return trimmed;
  }

  // Fallback to environment variables
  if (provider === 'gemini') {
    return process.env.GEMINI_API_KEY || null;
  }
  if (provider === 'openai') {
    return process.env.OPENAI_API_KEY || null;
  }
  if (provider === 'openrouter') {
    return process.env.OPENROUTER_API_KEY || null;
  }
  return null;
}

/**
 * Asynchronous generator that streams LLM tokens from Gemini, OpenAI, or OpenRouter.
 */
export async function* streamLlmResponse(opts: LlmRequestOptions): AsyncGenerator<string> {
  const { provider, systemPrompt, history, message } = opts;
  const apiKey = resolveApiKey(provider, opts.apiKey);
  const modelName = opts.customModel?.trim() || DEFAULT_MODELS[provider];

  if (!apiKey) {
    throw new Error(
      `No API key configured for ${PROVIDER_LABELS[provider]}. Please add your API key in Settings.`,
    );
  }

  if (provider === 'gemini') {
    yield* streamGemini(apiKey, modelName, systemPrompt, history, message);
  } else if (provider === 'openai' || provider === 'openrouter') {
    yield* streamOpenAiCompatible(provider, apiKey, modelName, systemPrompt, history, message);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Stream responses using Google Gemini API.
 */
async function* streamGemini(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  history: ChatMessageTurn[],
  message: string,
): AsyncGenerator<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  });

  const chatHistory = history
    .filter((h) => h.role === 'user' || h.role === 'assistant')
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessageStream(message);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

/**
 * Stream responses using OpenAI or OpenRouter (OpenAI-compatible SSE API).
 */
async function* streamOpenAiCompatible(
  provider: 'openai' | 'openrouter',
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  history: ChatMessageTurn[],
  message: string,
): AsyncGenerator<string> {
  const endpoint =
    provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://chesswise-web.vercel.app';
    headers['X-Title'] = 'Chesswise AI Coach';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelName,
      messages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Provider returned HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.error?.message || errorMessage;
    } catch {
      if (errorBody) errorMessage = `${errorMessage}: ${errorBody.slice(0, 150)}`;
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('No response stream received from AI provider.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue; // comments or ping
      if (trimmed === 'data: [DONE]') return;

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const json = JSON.parse(jsonStr);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            yield delta;
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }
    }
  }
}

/**
 * Validates an API key on demand by sending a 1-token test prompt.
 */
export async function testLlmKey(
  provider: AiProvider,
  apiKey: string,
  customModel?: string,
): Promise<{ ok: boolean; message: string; model: string }> {
  const modelName = customModel?.trim() || DEFAULT_MODELS[provider];

  try {
    if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent('Say OK');
      const txt = res.response.text();
      return {
        ok: true,
        message: `Success! Connected to Google AI Studio (${modelName}): "${txt.trim()}"`,
        model: modelName,
      };
    } else {
      const endpoint =
        provider === 'openrouter'
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };

      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://chesswise-web.vercel.app';
        headers['X-Title'] = 'Chesswise Key Test';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = `HTTP ${res.status}`;
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error?.message || errMsg;
        } catch {
          errMsg = text.slice(0, 100) || errMsg;
        }
        return {
          ok: false,
          message: `${PROVIDER_LABELS[provider]} test failed: ${errMsg}`,
          model: modelName,
        };
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || 'OK';
      return {
        ok: true,
        message: `Success! Connected to ${PROVIDER_LABELS[provider]} (${modelName}): "${reply}"`,
        model: modelName,
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Connection test failed. Please verify your API key.',
      model: modelName,
    };
  }
}

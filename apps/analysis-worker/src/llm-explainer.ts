import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const ExplanationSchema = z.object({
  explanation: z
    .string()
    .min(20)
    .max(500)
    .describe('Plain-language coaching note. Must not fabricate moves or evaluations.'),
});

export interface ExplainInput {
  movePlayed: string; // SAN
  bestMove: string; // SAN
  evalBefore: number; // centipawns
  evalAfter: number; // centipawns
  quality: string; // BLUNDER | MISTAKE | etc.
  tacticTag: string | null;
  fenBefore: string;
  customApiKey?: string | null;
  provider?: 'gemini' | 'openai' | 'openrouter';
  customModel?: string | null;
}

export interface ExplainResult {
  explanation: string;
  modelUsed: string;
}

const DEFAULT_MODEL = 'gemini-1.5-flash';

/**
 * Generates a short, grounded coaching explanation using Gemini, OpenAI, or OpenRouter.
 * The prompt strictly forbids fabricating moves or evaluations not in the input.
 */
export async function explainMistake(input: ExplainInput): Promise<ExplainResult | null> {
  const provider = input.provider || 'gemini';
  let apiKey = input.customApiKey?.trim() || null;

  if (!apiKey) {
    if (provider === 'gemini') apiKey = process.env.GEMINI_API_KEY || null;
    else if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY || null;
    else if (provider === 'openrouter') apiKey = process.env.OPENROUTER_API_KEY || null;
  }

  if (!apiKey) {
    console.warn(`[llm-explainer] No API key available for ${provider} — skipping explanation`);
    return null;
  }

  const modelName =
    input.customModel?.trim() ||
    (provider === 'openai'
      ? 'gpt-4o-mini'
      : provider === 'openrouter'
        ? 'meta-llama/llama-3.3-70b-instruct'
        : DEFAULT_MODEL);

  const evalBeforeFormatted = formatEval(input.evalBefore);
  const evalAfterFormatted = formatEval(input.evalAfter);
  const swingFormatted = formatEval(Math.abs(input.evalAfter - input.evalBefore));

  const tacticNote = input.tacticTag
    ? `The missed tactic type is: ${input.tacticTag.replace(/_/g, ' ')}.`
    : '';

  const prompt = `You are a chess coach giving feedback on a single mistake.

STRUCTURED FACTS (use ONLY these — do not invent any other moves or evaluations):
- Move played: ${input.movePlayed}
- Best move available: ${input.bestMove}
- Position evaluation before: ${evalBeforeFormatted}
- Position evaluation after playing ${input.movePlayed}: ${evalAfterFormatted}
- Evaluation swing: ${swingFormatted} in opponent's favor
- Move quality: ${input.quality}
- ${tacticNote}

STRICT RULES:
1. Do NOT mention any chess move notation (e.g. "Nf3", "Rxe8") other than "${input.movePlayed}" and "${input.bestMove}".
2. Do NOT mention any evaluation number other than "${evalBeforeFormatted}", "${evalAfterFormatted}", "${swingFormatted}".
3. Write 2-3 sentences maximum. Plain English only.
4. Focus on WHY the played move was bad and WHAT the best move accomplished.

Write the coaching note now:`;

  try {
    let text = '';

    if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      text = result.response.text().trim();
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
        headers['X-Title'] = 'Chesswise Analysis Worker';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        throw new Error(`Provider returned HTTP ${res.status}`);
      }

      const data = await res.json();
      text = data.choices?.[0]?.message?.content?.trim() || '';
    }

    // Validate with Zod
    const parsed = ExplanationSchema.parse({ explanation: text });
    return { explanation: parsed.explanation, modelUsed: modelName };
  } catch (err) {
    console.error('[llm-explainer] Failed to generate explanation:', err);
    return null;
  }
}

function formatEval(cp: number): string {
  if (Math.abs(cp) >= 30000) {
    return cp > 0 ? 'forced mate for White' : 'forced mate for Black';
  }
  const pawns = (cp / 100).toFixed(2);
  return cp >= 0 ? `+${pawns}` : pawns;
}
